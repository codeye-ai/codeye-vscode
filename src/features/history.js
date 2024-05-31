const crc32 = require("crc-32");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function load(cwd) {
  const filePath = toPath(cwd);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return null;
}

async function save(cwd, messages) {
  fs.writeFileSync(toPath(cwd), JSON.stringify(messages, null, 2), "utf-8");
}

function toPath(cwd) {
  const hash = crc32.str(cwd).toString(16);
  return path.join(os.homedir(), `.codeye_${hash}.json`);
}

module.exports = {
  load,
  save,
};
