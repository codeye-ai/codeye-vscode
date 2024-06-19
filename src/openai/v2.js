const OpenAI = require("openai").default;

const { load, save } = require("../utils/persistence");
const functions = require("../functions");

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

const OPENAI_MODEL = process.env.CODEYE_OPENAI_MODEL || "gpt-4o";

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

async function init(wd, reset, prompt) {
  let assistant = await load("$codeye$", "assistant", "json");
  if (!assistant) {
    assistant = await openai.beta.assistants.create({
      name: "Codeye",
      instructions: prompt,
      tools,
      model: OPENAI_MODEL,
    });

    await save(wd, assistant.id, "assistant", "json");
  }

  let thread = await load(wd, "thread", "json");
  if (!thread || reset) {
    thread = await openai.beta.threads.create();

    await save(wd, thread.id, "thread", "json");
  }

  return {
    assistant: assistant.id,
    thread: thread.id,
  };
}

async function respond(
  wd,
  { assistant, thread },
  text,
  a,
  b,
  callback,
  writer = null,
) {
  await openai.beta.threads.messages.create(thread, {
    role: "user",
    content: text,
  });

  let run = await openai.beta.threads.runs.createAndPoll(
    thread,
    {
      assistant_id: assistant,
    },
    {
      pollIntervalMs: 500,
    },
  );

  while (true) {
    if (run.status === "completed") {
      const { data } = await openai.beta.threads.messages.list(thread, {
        order: "desc",
      });
      const message = data[0];
      callback(null, message.content[0].text.value);
      return;
    }

    const calls = run.required_action.submit_tool_outputs.tool_calls;
    const outputs = [];

    for (const call of calls) {
      const impl = functions[call.function.name]["impl"];
      const args = JSON.parse(call.function.arguments);

      if (writer) {
        writer(
          call.function.name,
          JSON.stringify(
            !!args.contents ? { ...args, contents: "<redacted>" } : args,
          ),
        );
      }

      const output = await impl(args);
      outputs.push({
        tool_call_id: call.id,
        output,
      });
    }

    run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
      thread,
      run.id,
      {
        tool_outputs: outputs,
      },
      {
        pollIntervalMs: 500,
      },
    );
  }
}

module.exports = { init, respond };
