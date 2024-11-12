const claude = require("./anthropic/claude");
const chatgpt = require("./openai/chatgpt").v2;
const gemini = require("./google/gemini");

module.exports = function (engine) {
  switch (engine) {
    case "claude-3-5-sonnet-20240620":
      return claude;
    case "gemini-1.5-flash-001":
    case "gemini-1.5-pro-001":
      return gemini;
    case "gpt-3.5-turbo":
    case "gpt-4o":
    case "gpt-4o-mini":
    case "o1-preview":
    case "o1-mini":
    default:
      return chatgpt;
  }
};
