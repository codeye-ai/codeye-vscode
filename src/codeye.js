const OpenAI = require("openai").default;
const os = require("os");
const repl = require("repl");

const { load, save } = require("./features/history");
const functions = require("./functions");

const OPENAI_MODEL = process.env.CODEYE_OPENAI_MODEL || "gpt-4o";
const OPENAI_TOKEN_LIMIT = (OPENAI_MODEL === "gpt-4o" ? 128 : 16) * 1000; // 128K is max on gpt-4o, 16K on gpt-3.5-turbo

const cwd = process.cwd();

const openai = new OpenAI({
  apiKey: process.env.CODEYE_OPENAI_API_KEY,
  organization: process.env.CODEYE_OPENAI_ORGANIZATION,
});

const tools = Object.values(functions).map((x) => ({
  type: "function",
  function: x.spec,
}));

async function respond(messages, content, a, b, callback, verbose = false) {
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
      model: OPENAI_MODEL,
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

      if (verbose) {
        console.log(
          `Running tool: ${name}`,
          JSON.stringify(
            !!args.contents ? { ...args, contents: "<redacted>" } : args,
          ),
        );
      }

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

async function generate(fresh = false, verbose = false) {
  const messages = [];
  if (!fresh) {
    const history = await load(cwd);
    if (history) {
      messages.push(...history);
    }
  }

  if (!messages?.length) {
    let system;
    if (os.platform() === "linux") {
      system = await new Promise((resolve, reject) => {
        getos(function (e, os) {
          if (e) {
            reject(e);
            return;
          }

          resolve({ arch: process.arch, ...os });
        });
      });
    } else {
      system = {
        platform: os.platform(),
        release: os.release(),
        arch: process.arch,
      };
    }

    messages.push({
      role: "system",
      content: [
        "You are a code generation tool named Codeye, designed to write quality code/software.",
        "To close, end or exit the tool session, users must explicitly type '.exit' and hit Enter.",
        "Reply briefly, preferably one line summaries only.",
        "Prefer to write/update code directly into files and skip sending big chunks of code as replies.",
        "Current directory is: " + cwd,
        "Platform / operatin system is: " + JSON.stringify(os),
        "If working on an existing project, try determining the project type by listing and reading files in current directory.",
        "If unable to determine project type, ask the user explicitly.",
      ].join(" "),
    });
  }

  repl.start({
    prompt: "codeye % ",
    eval: (a, b, c, d) => respond(messages, a, b, c, d, verbose),
    useColors: false,
    writer: (output) => output,
  });
}

module.exports = { generate };
