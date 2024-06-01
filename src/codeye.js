const OpenAI = require("openai").default;
const repl = require("repl");

const { load, save } = require("./features/history");
const functions = require("./functions");

let openAiApiKey;
let openAiOrganization;
let openAiModel;

try {
  const vscode = require("vscode");
  const codeye = vscode.workspace.getConfiguration("codeye.setting");

  openAiApiKey = codeye.get("openAiApiKey");
  openAiOrganization = codeye.get("openAiOrganization");
  openAiModel = codeye.get("openAiModel");
} catch (e) {
  openAiApiKey = process.env.CODEYE_OPENAI_API_KEY;
  openAiOrganization = process.env.CODEYE_OPENAI_ORGANIZATION;
  openAiModel = process.env.CODEYE_OPENAI_MODEL || "gpt-4o";
}

const OPENAI_TOKEN_LIMIT = (openAiModel === "gpt-4o" ? 128 : 16) * 1000; // 128K is max on gpt-4o, 16K on gpt-3.5-turbo

const cwd = process.cwd();

const openai = new OpenAI({
  apiKey: openAiApiKey,
  organization: openAiOrganization,
});

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

async function respond(messages, content, a, b, callback) {
  messages.push({ role: "user", content });

  while (true) {
    while (
      tokenize(messages) > OPENAI_TOKEN_LIMIT ||
      messages[1]?.role === "tool"
    ) {
      messages.splice(1, 1);
    }

    const completion = await openai.chat.completions.create({
      messages,
      model: openAiModel,
      tools,
    });

    const message = completion.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      await save(cwd, messages);
      callback(null, message.content);
      break;
    }

    for (const call of message.tool_calls) {
      const { name, arguments } = call.function;

      const impl = functions[name]["impl"];
      const args = JSON.parse(arguments);

      const content = await impl(args);

      messages.push({
        tool_call_id: call.id,
        role: "tool",
        name: name,
        content,
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

async function generate(fresh = false) {
  const messages = [];
  if (!fresh) {
    const history = await load(cwd);
    if (history) {
      messages.push(...history);
    }
  }

  if (!messages?.length) {
    messages.push({
      role: "system",
      content: [
        "You are a code generation tool named Codeye, designed to write quality code/software.",
        "To close, end or exit the tool session, users must explicitly type '.exit' and hit Enter.",
        "Reply briefly, preferably one line summaries only.",
        "Prefer to write/update code directly into files and skip sending big chunks of code as replies.",
        "Current directory is: " + cwd,
        "If working on an existing project, try determining the project type by listing and reading files in current directory.",
        "If unable to determine project type, ask the user explicitly.",
      ].join(" "),
    });
  }

  repl.start({
    prompt: "codeye % ",
    eval: (a, b, c, d) => respond(messages, a, b, c, d),
    useColors: false,
    writer: (output) => output,
  });
}

module.exports = { generate };
