const { stdin: input, stdout: output } = require("node:process");
const ora = require("ora");
const readline = require("node:readline/promises");

async function ask(question) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();

  return answer;
}

async function loader(message, callback) {
  const spinner = ora(message).start();
  const result = await callback();
  spinner.stop();

  return result;
}

module.exports = { ask, loader };
