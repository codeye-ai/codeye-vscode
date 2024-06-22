const OpenAI = require("openai").default;

const functions = require("../../../functions");
const { load, save } = require("../../../utils/persistence");

const OPENAI_MODEL = process.env.CODEYE_AI_MODEL || "gpt-4o";
const OPENAI_TOKEN_LIMIT = (OPENAI_MODEL === "gpt-4o" ? 128 : 16) * 1000; // 128K is max on gpt-4o, 16K on gpt-3.5-turbo

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

async function init(wd, reset, instructions) {
  const messages = [];
  if (!reset) {
    const history = await load(wd, "openai-v1", "history");
    if (history) {
      messages.push(...history);
    }
  }

  if (!messages.length) {
    messages.push({
      role: "system",
      content: instructions,
    });
  }

  return messages;
}

async function respond(wd, messages, text, a, b, callback, writer = null) {
  messages.push({ role: "user", content: text });

  while (true) {
    while (
      tokenize(messages) > OPENAI_TOKEN_LIMIT ||
      (messages > 0 && messages[1].role !== "user")
    ) {
      messages.splice(1, 1);
    }

    const completion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
      tools,
    });

    const message = completion.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      await save(wd, messages, "openai-v1", "history");
      callback(null, message.content);
      break;
    }

    for (const tool of message.tool_calls) {
      const { name, arguments: argsStr } = tool.function;

      const impl = functions[name]["impl"];
      const args = JSON.parse(argsStr);

      if (writer) {
        writer(
          name,
          JSON.stringify(
            !!args.contents ? { ...args, contents: "<redacted>" } : args,
          ),
        );
      }

      const output = await impl(args);

      messages.push({
        role: "tool",
        tool_call_id: tool.id,
        name: name,
        content: output,
      });
    }
  }
}

function tokenize(messages) {
  return messages.reduce(
    (acc, message) => acc + (message.content?.length || 0),
    0,
  );
}

module.exports = { init, respond };
