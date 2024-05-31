const crc32 = require("crc-32");
const { stdin: input, stdout: output } = require("process");
const readline = require("readline/promises");
const { load, save } = require("./features/history");
const functions = require("./functions");

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

const MAX_TOKENS = 8000;

async function ask(question) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

async function client(service) {
  if (service === "openai") {
    const OpenAI = require("openai").default;
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
    });
  } else if (service === "mistralai") {
    return import("@mistralai/mistralai").then(({ default: MistralAI }) => {
      return new MistralAI(process.env.MISTRAL_API_KEY);
    });
  } else {
    throw new Error(`Unsupported AI service: ${service}`);
  }
}

function tokenize(messages) {
  return messages.reduce(
    (acc, message) => acc + (message.content?.length || 0),
    0,
  );
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
          "Reply briefly, preferably one line summaries only.",
          "Current directory is: " + cwd,
        ].join(" "),
      },
    ];
  }

  const ai = await client(process.env.AI_SERVICE);
  let exited = false;

  for (let i = 0; ; i++) {
    if (i === 0) {
      messages.push({
        role: "user",
        content: "Hello",
      });
    }

    while (tokenize(messages) > MAX_TOKENS) {
      messages.splice(1, 1);
    }

    let completion;
    if (process.env.AI_SERVICE === "openai") {
      completion = await ai.chat.completions.create({
        messages,
        model: "gpt-4o",
        tools,
      });
    } else if (process.env.AI_SERVICE === "mistralai") {
      completion = await ai.chat({
        messages,
        model: "mistral-large-latest",
        tools,
      });
    }

    const message = completion.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      console.log("AI says: ", message.content);
      if (exited) {
        await save(cwd, messages);
        break;
      }

      const prompt = await ask("Reply or ^C: ");

      if (i === 0) {
        messages.push({
          role: "system",
          content: [
            "If working on an existing project, try determining the project type by listing and reading files in current directory.",
            "If unable to determine project type, ask the user explicitly.",
          ].join(" "),
        });
      }

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

module.exports = { generate };
