const fs = require("fs");
const path = require("path");

async function impl({ path: file }) {
  if (!fs.existsSync(file)) {
    return `File ${file} does not exist.`;
  }

  const cwd = process.cwd();
  const absolute = path.resolve(file);

  if (!absolute.startsWith(cwd)) {
    return `File ${file} is outside the current working directory.`;
  }

  fs.unlinkSync(file);

  return `File ${file} deleted successfully.`;
}

const spec = {
  name: "delete-file",
  description: "Deletes a file from file system.",
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
