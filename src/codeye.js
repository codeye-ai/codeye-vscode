const crc32 = require("crc-32");
const OpenAI = require("openai").default;
const { stdin: input, stdout: output } = require("process");
const readline = require("readline/promises");
const { load, save } = require("./features/history");
const functions = require("./functions");

const OPENAI_MODEL = "gpt-4o";
const OPENAI_TOKEN_LIMIT = 128 * 1000; // 128K is max on gpt-4o

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

async function ask(question) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

async function generate(fresh = false) {
  const cwd = process.cwd();
  const messages = [];
  if (!fresh) {
    const history = await load(cwd);
    messages.push(...history);
  }

  if (!messages?.length) {
    messages.push({
      role: "system",
      content: [
        "You are a code generation tool named Codeye, designed to write quality code/software.",
        "If working on an existing project, try determining the project type by listing and reading files in current directory.",
        "If unable to determine project type, ask the user explicitly.",
        "Reply briefly, preferably one line summaries only.",
        "Prefer to write/update code directly into files and skip sending big chunks of code as replies.",
        "Current directory is: " + cwd,
      ].join(" "),
    });
  }

  let exited = false;

  for (let i = 0; ; i++) {
    if (i === 0) {
      messages.push({
        role: "user",
        content: "Hello",
      });
    }

    while (
      tokenize(messages) > OPENAI_TOKEN_LIMIT ||
      messages[1]?.role === "tool"
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
      console.log("AI says:", message.content);
      if (exited) {
        await save(cwd, messages);
        break;
      }

      const prompt = await ask("Reply or ^C: ");
      messages.push({ role: "user", content: prompt });
      continue;
    }

    for (const call of message.tool_calls) {
      const { name, arguments } = call.function;

      console.log("magic", crc32.str(name), "executing...");

      const impl = functions[name]["impl"];
      const args = JSON.parse(arguments);
      const content = await impl(args);
      messages.push({
        tool_call_id: call.id,
        role: "tool",
        name: name,
        content,
      });

      if (name === "exit-process") {
        exited = true;
      }
    }
  }
}

function tokenize(messages) {
  return messages.reduce(
    (acc, message) => acc + (message.content?.length || 0),
    0,
  );
}

module.exports = { generate };
