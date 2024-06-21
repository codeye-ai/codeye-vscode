const OpenAI = require("openai").default;

const { load, save } = require("../utils/persistence");
const functions = require("../functions");

const OPENAI_MODEL = process.env.CODEYE_OPENAI_MODEL || "gpt-4o";
const OPENAI_TOKEN_LIMIT = (OPENAI_MODEL === "gpt-4o" ? 128 : 16) * 1000; // 128K is max on gpt-4o, 16K on gpt-3.5-turbo

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

async function init(wd, reset, prompt) {
  const messages = [];
  if (!reset) {
    const history = await load(wd, "history", "json");
    if (history) {
      messages.push(...history);
    }
  }

  if (!messages.length) {
    messages.push({
      role: "system",
      content: prompt,
    });
  }

  return messages;
}

async function respond(wd, messages, text, a, b, callback, writer = null) {
  messages.push({ role: "user", content: [{ type: "text", text }] });

  while (true) {
    while (
      tokenize(messages) > OPENAI_TOKEN_LIMIT ||
      (messages && messages[1].role === "tool")
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
      await save(wd, messages, "history", "json");
      callback(null, message.content);
      break;
    }

    for (const call of message.tool_calls) {
      const { name, arguments: argsStr } = call.function;

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

      const response = await impl(args);

      let content;
      if (typeof response === "string") {
        content = [{ type: "text", text: response }];
      } else {
        content = response;
      }

      messages.push({
        tool_call_id: call.id,
        role: "tool",
        name: name,
        content: content.filter((x) => x.type === "text"),
      });

      const images = content.filter((x) => x.type === "image_url");
      if (images.length) {
        messages.push({
          role: "user",
          content: images,
        });
      }
    }
  }
}

function tokenize(messages) {
  return messages.reduce(
    (acc, message) => acc + (message.content ? message.content.length : 0),
    0,
  );
}

module.exports = { init, respond };
