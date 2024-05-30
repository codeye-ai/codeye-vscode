const crc32 = require("crc-32");
const OpenAI = require("openai").default;
const { stdin: input, stdout: output } = require("process");
const readline = require("readline/promises");

const { load, save } = require("./features/history");
const functions = require("./functions");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
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

async function generate() {
  const cwd = process.cwd();
  let messages = await load(cwd);

  if (!messages) {
    messages = [
      {
        role: "system",
        content: [
          "You are a code generation tool named Codeye, designed to write quality code/software.",
          "If working on an existing project, try determining the project type by listing and reading files in current directory.",
          "If unable to determine project type, ask the user explicitly.",
          "Reply briefly, preferably one line summaries only.",
          "Current directory is: " + cwd,
        ].join(" "),
      },
    ];
  }

  let initial = true;

  while (true) {
    if (initial) {
      messages.push({
        role: "user",
        content: "Hello",
      });
      initial = false;
    }

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
      tools,
    });

    const message = completion.choices[0].message;
    if (!message.tool_calls) {
      messages.push({ role: "assistant", content: message.content });
      console.log("AI says:", message.content);
      messages.push({ role: "user", content: await ask("Reply or ^C: ") });

      await save(cwd, messages);
      continue;
    }

    messages.push(message);
    for (const call of message.tool_calls) {
      const { name, arguments } = call.function;

      console.log("magic", crc32.str(name), "executing...");

      const impl = functions[name]["impl"];
      const args = JSON.parse(arguments);
      const result = await impl(args);
      messages.push({
        tool_call_id: call.id,
        role: "tool",
        name: name,
        content: result,
      });

      await save(cwd, messages);
    }
  }
}

module.exports = { generate };
