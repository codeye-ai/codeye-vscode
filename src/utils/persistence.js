const crc32 = require("crc-32");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function load(cwd, name, ext) {
  const filePath = pathify(cwd, name, ext);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  return null;
}

function pathify(cwd, name, ext) {
  const codeye = path.join(os.homedir(), ".codeye");
  if (!fs.existsSync(codeye)) {
    fs.mkdirSync(codeye, { recursive: true });
  }

  if (cwd) {
    const hash = crc32.str(cwd).toString(16);
    return path.join(codeye, `${name}_${hash}.${ext}`);
  }

  return path.join(codeye, `${name}.${ext}`);
}

async function save(cwd, data, name, ext) {
  fs.writeFileSync(
    pathify(cwd, name, ext),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

module.exports = {
  load,
  save,
};
