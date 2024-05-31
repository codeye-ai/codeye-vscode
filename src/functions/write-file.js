const fs = require("fs");
const path = require("path");

async function impl({ path: filepath, contents }) {
  try {
    const directory = path.dirname(filepath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  } catch (ignore) {
    // suppress failure
  }

  return fs.promises
    .writeFile(filepath, contents, { encoding: "utf-8" })
    .then(() => true)
    .catch(() => false)
    .then((success) => JSON.stringify({ success }));
}

const spec = {
  name: "write-file",
  description:
    "Write text contents into file. It also creates missing parent folders automatically, if needed.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to file. It can either be absolute of relative to current directory.",
      },
      contents: {
        type: "string",
        description: "String contents to be written into the file.",
      },
    },
    required: ["path", "contents"],
  },
};

module.exports = {
  impl,
  spec,
};
