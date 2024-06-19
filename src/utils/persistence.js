const crc32 = require("crc-32");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function load(cwd, prefix, ext) {
  const filePath = pathify(cwd, prefix, ext);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  return null;
}

function pathify(cwd, prefix, ext) {
  const codeye = path.join(os.homedir(), ".codeye");
  if (!fs.existsSync(codeye)) {
    fs.mkdirSync(codeye, { recursive: true });
  }

  const hash = crc32.str(cwd).toString(16);
  return path.join(codeye, `${prefix}_${hash}.${ext}`);
}

async function save(cwd, data, prefix, ext) {
  fs.writeFileSync(
    pathify(cwd, prefix, ext),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

module.exports = {
  load,
  save,
};
