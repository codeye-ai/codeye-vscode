const fs = require("fs");
const path = require("path");

async function impl({ path: dir }) {
  const result = [];

  function recursive(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach((item) => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        result.push({ name: fullPath, type: "directory" });
        recursive(fullPath);
      } else {
        result.push({ name: fullPath, type: "file" });
      }
    });
  }

  recursive(dir);
  return JSON.stringify(result);
}

const spec = {
  name: "list_files_recursively",
  description: "List all files and directories in a directory recursively.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to a directory to list files and directories. It can either be absolute or relative to current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
