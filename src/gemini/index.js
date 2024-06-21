const { GoogleGenerativeAI } = require("@google/generative-ai");

const { load, save } = require("../utils/persistence");
const functions = require("../functions");

const GEMINI_MODEL = process.env.CODEYE_GEMINI_MODEL || "gemini-1.5-flash-001";

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

async function init(wd, reset, prompt) {
  const messages = [];
  if (!reset) {
    const history = await load(wd, "history", "json");
    if (history) {
      messages.push(...history);
    }
  }

  const chat = model.startChat({
    history: messages,
    systemInstruction: {
      role: "system",
      parts: [{ text: prompt }],
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
    const calls = response.functionCalls();
    if (!calls?.length) {
      await save(wd, messages, "history", "json");
      callback(null, response.text()?.trim());
      return;
    }

    const responses = [];
    for (const call of calls) {
      const impl = functions[call.name]["impl"];

      if (writer) {
        writer(
          call.name,
          JSON.stringify(
            !!call.args.contents
              ? { ...call.args, contents: "<redacted>" }
              : call.args,
          ),
        );
      }

      const output = await impl(call.args);
      const reply = {
        functionResponse: {
          name: call.name,
          response: {
            name: call.name,
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
