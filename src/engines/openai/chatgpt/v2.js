const OpenAI = require("openai").default;

const functions = require("../../../functions");
const { load, save } = require("../../../utils/persistence");

const OPENAI_MODEL = process.env.CODEYE_AI_MODEL || "gpt-4o";

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

async function init(wd, reset, instructions) {
  let state = await load(wd, "openai-v2", "state");
  if (!state || reset) {
    const assistant = await openai.beta.assistants.create({
      name: "Codeye",
      instructions,
      tools,
      model: OPENAI_MODEL,
    });
    const thread = await openai.beta.threads.create();

    state = {
      assistant: assistant.id,
      thread: thread.id,
    };

    await save(wd, state, "openai-v2", "state");
  }

  return state;
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

    for (const tool of calls) {
      const impl = functions[tool.function.name]["impl"];
      const args = JSON.parse(tool.function.arguments);

      if (writer) {
        writer(
          tool.function.name,
          JSON.stringify(
            !!args.contents ? { ...args, contents: "<redacted>" } : args,
          ),
        );
      }

      const output = await impl(args);
      outputs.push({
        tool_call_id: tool.id,
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
