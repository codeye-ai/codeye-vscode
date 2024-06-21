const { Anthropic } = require("@anthropic-ai/sdk");

const functions = require("../functions");
const { load, save } = require("../utils/persistence");

const ANTHROPIC_MODEL =
  process.env.CODEYE_ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_TOKEN_LIMIT = 200 * 1000; // 200K is max on claude-*

const anthropic = new Anthropic({
  apiKey: process.env.CODEYE_ANTHROPIC_API_KEY,
});

const tools = Object.values(functions).map((x) => ({
  name: x.spec.name,
  description: x.spec.description,
  input_schema: x.spec.parameters,
}));

async function init(wd, reset, instructions) {
  const messages = [];
  if (!reset) {
    const history = await load(wd, "history", "json");
    if (history) {
      messages.push(...history);
    }
  }

  return { messages, instructions };
}

async function respond(
  wd,
  { messages, instructions },
  text,
  a,
  b,
  callback,
  writer = null,
) {
  messages.push({ role: "user", content: [{ type: "text", text }] });

  while (true) {
    while (
      tokenize(messages) > ANTHROPIC_TOKEN_LIMIT ||
      (messages.length && messages[0].role !== "user")
    ) {
      messages.splice(0, 1);
    }

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      messages,
      system: instructions,
      tools,
    });

    const { role, content } = message;
    messages.push({ role, content });

    if (message.content.length === 1 && message.content[0].type === "text") {
      await save(wd, messages, "history", "json");
      callback(null, message.content[0].text);
      break;
    }

    const uses = message.content.filter((x) => x.type === "tool_use");

    for (const tool of uses) {
      const { name, input: args } = tool;

      const impl = functions[name]["impl"];

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
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: tool.id,
            content: output,
          },
        ],
      });
    }
  }
}

function tokenize(messages) {
  return messages.reduce(
    (acc, message) => acc + JSON.stringify(message.content).length,
    0,
  );
}

module.exports = { init, respond };
