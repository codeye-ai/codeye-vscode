const chalk = require("chalk");
const getos = require("getos");
const os = require("os");
const repl = require("repl");

const { init, respond } = require("./anthropic");
const { processes } = require("./functions/run-command");

const wd = process.cwd();

async function main(reset = false, verbose = false) {
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

  const state = await init(
    wd,
    reset,
    [
      "You are a code generation tool named Codeye, designed to write quality code/software.",
      "You can read and process any kind of text or image files for understanding the task.",
      "To close, end or exit the tool session, users must explicitly type '.exit' and hit Enter.",
      "Reply briefly, preferably one line summaries only.",
      "Always write generated code directly into files and skip sending big chunks of code as chat replies.",
      "Platform / operating system is: '" + JSON.stringify(system) + "'.",
      "Current directory is: '" + wd + "'.",
      "If working on an existing project, try determining the project type by listing and reading files in current directory.",
      "If unable to determine project type, ask the user explicitly.",
    ].join(" "),
  );
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
