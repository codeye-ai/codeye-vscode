const { GoogleGenerativeAI } = require("@google/generative-ai");

function fromOpenAI(msg) {
  let parts;
  if (Array.isArray(msg.content)) {
    parts = msg.content.map(({ type, ...y }) => y);
  } else {
    parts = { text: msg.content };
  }

  if (msg.tool_calls) {
    return {
      role: "model",
      parts: msg.tool_calls.map((x) => ({
        functionCall: {
          name: x.function.name,
          args: JSON.parse(x.function.arguments),
        },
      })),
    };
  }

  if (msg.role === "tool") {
    return {
      role: "function",
      parts: {
        functionResponse: {
          name: msg.tool_call_id,
          response: {
            name: msg.tool_call_id,
            content: JSON.stringify(msg.content),
          },
        },
      },
    };
  }

  return {
    role: msg.role === "assistant" ? "model" : "user",
    parts,
  };
}

function toOpenAI(completion) {
  return {
    choices: completion.candidates.map((x) => {
      const functionCall = x.content.parts[0]?.functionCall;
      const message = { role: "assistant" };
      if (!!functionCall) {
        const toolCalls = [];
        x.content.parts.forEach((x) => {
          toolCalls.push({
            id: x.functionCall.name,
            function: {
              name: x.functionCall.name,
              arguments: JSON.stringify(x.functionCall.args),
            },
          });
        });
        message.tool_calls = toolCalls;
      } else {
        message.content = x.content.parts[0]?.text?.trim();
      }

      return { message };
    }),
  };
}

module.exports = function (apiKey, model, functions) {
  const ggai = new GoogleGenerativeAI(apiKey);
  const tools = [
    {
      functionDeclarations: Object.values(functions).map((x) => x.spec),
    },
  ];
  const model2 = ggai.getGenerativeModel(
    { model, tools },
    { apiVersion: "v1beta" },
  );

  return {
    async completion(messages) {
      const contents = messages.map((x) => fromOpenAI(x));
      const { response } = await model2.generateContent({ contents, tools });
      const transformed = toOpenAI(response);
      return transformed;
    },
  };
};
