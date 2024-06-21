const fs = require("fs/promises");

async function impl({ path }) {
  return fs
    .readdir(path, { withFileTypes: true })
    .then((files) => files.filter((x) => ![".", ".."].includes(x.name)))
    .then((files) =>
      files.map((x) => ({
        name: x.name,
        type: x.isDirectory() ? "directory" : "file",
      })),
    )
    .then((files) => JSON.stringify(files));
}

const spec = {
  name: "list_files",
  description: "List all files and directories in a directory by its path.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to a directory in which to list files and directories. It can either be absolute of relative to current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
