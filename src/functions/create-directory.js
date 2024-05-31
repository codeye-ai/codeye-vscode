const fs = require("fs");

async function impl({ path }) {
  return fs.promises
    .mkdir(path, { recursive: true })
    .then(() => JSON.stringify({ success: true }))
    .catch((error) => JSON.stringify({ success: false, error: error.message }));
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
