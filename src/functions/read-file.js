const fs = require("fs");

async function impl({ path }) {
  return fs.existsSync(path)
    ? fs.readFileSync(path, { encoding: "utf-8" })
    : `File ${path} does not exist.`;
}

const spec = {
  name: "read-file",
  description: "Reads text contents of a file and returns it as string.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to file. It can either be absolute of relative to current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
