const fs = require("fs/promises");

async function impl({ path }) {
  return fs
    .mkdir(path, { recursive: true })
    .then(() => true)
    .catch(() => false)
    .then((success) => JSON.stringify({ success }));
}

const spec = {
  name: "create-directory",
  description: "Creates a directory and its parents if they don't exist.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to the directory to create. It can either be absolute or relative to the current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
