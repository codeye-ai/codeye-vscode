const chalk = require("chalk");
const getos = require("getos");
const os = require("os");
const repl = require("repl");

const engines = require("./engines");
const { processes } = require("./functions/run-command");
const { check, initiate, verify } = require("./utils/auth");
const { load } = require("./utils/persistence");
const { ask, loader } = require("./utils/cli");

const wd = process.cwd();

async function main(file = null, reset = false, verbose = false) {
  let auth;
  while (true) {
    auth = await loader(chalk.cyan("loading…"), () =>
      check().catch(() => false),
    );
    if (auth !== false) {
      break;
    }

    const { token, url } = await loader(
      chalk.yellow("starting login…"),
      initiate,
    );

    await ask(
      `Please login by visiting ${url} in a browser and PRESS ANY KEY when done.`,
    );

    auth = await loader(chalk.yellow("verifying…"), () =>
      verify(token).catch(() => false),
    );
  }

  if (auth === false) {
    console.log(chalk.red("login failed"));
    return;
  }

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

  const settings = await load(null, "settings", "json");
  const { init, respond } = engines(
    process.env.CODEYE_AI_MODEL || settings?.model,
  );
  const instructions = [
    "You are a code generation tool named Codeye, expert in software development.",
    "Do not apologise unnecessarily.",
    "Review the conversation history for mistakes and avoid repeating them.",
    "You can read and process any kind of text or image files for understanding the task.",
    "Before writing or suggesting code, perform a comprehensive code review of the existing code (if present) and understand how it works.",
    "If unable to determine project type from files in current directory, ask the user explicitly for programming language or framework of choice.",
    "Consider available frameworks and libraries, suggest their use whenever possible.",
    "Request clarification for anything unclear or ambiguous.",
    "Before code generation, break things down in to discrete changes, and suggest small testing after each change to make sure things are on right path.",
    "Always write generated code directly into files and skip sending big chunks of code as replies.",
    "Reply briefly, preferably one line summaries only.",
    "To close, end or exit the tool session, users must explicitly type '.exit' and hit Enter.",
    `Logged in user's email address is ${auth.email}.`,
    "Platform / operating system is: '" + JSON.stringify(system) + "'.",
    `Current directory is: '${wd}'.`,
  ];
  if (file) {
    instructions.push(`Current file is: '${file}'.`);
  }

  const state = await init(wd, reset, instructions.join(" "), settings);
  const writer = verbose
    ? (tool, args) => console.log(chalk.yellow(`tool → ${tool}`), args)
    : null;

  const prompt = "you → ";
  const r = repl.start({
    prompt: chalk.green(prompt),
    eval: (a, b, c, d) => respond(wd, state, (a || "").trim(), b, c, d, writer),
    useColors: true,
    writer: (output) => chalk.blue("codeye → ") + output + "\n",
  });
  r.setPrompt(chalk.green(prompt));
  r.on("exit", () => {
    Object.values(processes).forEach((process) => process.kill("SIGTERM"));
    process.exit();
  });
}

module.exports = { main };
