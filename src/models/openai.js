const OpenAI = require("openai").default;

module.exports = function (apiKey, organization = null, model, functions) {
  const openai = new OpenAI({ apiKey, organization });
  const tools = Object.values(functions).map((x) => ({
    type: "function",
    function: x.spec,
  }));

  return {
    async completion(messages) {
      return openai.chat.completions.create({ messages, model, tools });
    },
  };
};
