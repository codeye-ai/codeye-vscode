const { GoogleGenerativeAI } = require("@google/generative-ai");

const functions = require("../../functions");
const { load, save } = require("../../utils/persistence");

const GEMINI_MODEL = process.env.CODEYE_AI_MODEL || "google-1.5-flash-001";

const gai = new GoogleGenerativeAI(process.env.CODEYE_GEMINI_API_KEY);

const tools = [
  {
    functionDeclarations: Object.values(functions).map((x) => x.spec),
  },
];

const model = gai.getGenerativeModel(
  { model: GEMINI_MODEL },
  { apiVersion: "v1beta" },
);

async function init(wd, reset, instructions) {
  const messages = [];
  if (!reset) {
    const history = await load(wd, "gemini", "history");
    if (history) {
      messages.push(...history);
    }
  }

  const chat = model.startChat({
    history: messages,
    systemInstruction: {
      role: "system",
      parts: [{ text: instructions }],
    },
    tools,
  });

  return { chat, messages };
}

async function respond(
  wd,
  { chat, messages },
  text,
  a,
  b,
  callback,
  writer = null,
) {
  let { response } = await chat.sendMessage(text);
  while (true) {
    const tools = response.functionCalls();
    if (!tools?.length) {
      await save(wd, messages, "gemini", "history");
      callback(null, response.text()?.trim());
      return;
    }

    const responses = [];
    for (const tool of tools) {
      const impl = functions[tool.name]["impl"];

      if (writer) {
        writer(
          tool.name,
          JSON.stringify(
            !!tool.args.contents
              ? { ...tool.args, contents: "<redacted>" }
              : tool.args,
          ),
        );
      }

      const output = await impl(tool.args);
      const reply = {
        functionResponse: {
          name: tool.name,
          response: {
            name: tool.name,
            content: output,
          },
        },
      };
      responses.push(reply);
    }

    const result = await chat.sendMessage(responses);
    response = result.response;
  }
}

module.exports = { init, respond };
