const fs = require("fs");

async function impl({ path }) {
  if (!fs.existsSync(path)) {
    return `File ${path} does not exist.`;
  }

  fs.unlinkSync(path);

  return `File ${path} deleted successfully.`;
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
