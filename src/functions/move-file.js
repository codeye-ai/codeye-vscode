const fs = require("fs/promises");

async function impl({ oldPath, newPath }) {
  return fs
    .mkdir(path.dirname(destination), { recursive: true })
    .then(() => fs.rename(oldPath, newPath))
    .then(() => true)
    .catch(() => false)
    .then((success) => JSON.stringify({ success }));
}

const spec = {
  name: "move-file",
  description: "Moves or rename a file from old path to new path",
  parameters: {
    type: "object",
    properties: {
      oldPath: {
        type: "string",
        description:
          "Current path of the file to be moved or renamed. It can either be absolute or relative to the current directory.",
      },
      newPath: {
        type: "string",
        description:
          "Path to move or rename the file to. It can either be absolute or relative to the current directory.",
      },
    },
    required: ["oldPath", "newPath"],
  },
};

module.exports = {
  impl,
  spec,
};
