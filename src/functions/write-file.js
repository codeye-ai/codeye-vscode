const fs = require("fs/promises");
const path = require("path");

async function impl({ path: filePath, contents }) {
  return fs
    .mkdir(path.dirname(filePath), { recursive: true })
    .then(() => fs.writeFile(filePath, contents, { encoding: "utf-8" }))
    .then(() => true)
    .catch(() => false)
    .then((success) => JSON.stringify({ success }));
}

const spec = {
  name: "write_file",
  description:
    "Write text contents into file. It also creates missing parent directories automatically, if needed.",
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
