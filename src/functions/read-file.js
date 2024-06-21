const fs = require("fs");

async function impl({ path }) {
  if (!fs.existsSync(path)) {
    return `File ${path} does not exist.`;
  }

  return fs.readFileSync(path, { encoding: "utf-8" });
}

const spec = {
  name: "read_file",
  description: "Reads contents of a file as text and returns it as string.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to file. It can either be absolute or relative to current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
