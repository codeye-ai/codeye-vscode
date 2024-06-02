const fs = require("fs");
const { lookup } = require("mime-types");

const impl = ({ path }) => {
  if (!fs.existsSync(path)) {
    return `File or directory at ${path} does not exist.`;
  }

  const stats = fs.statSync(path);

  return JSON.stringify({
    mime: lookup(path) || "unknown",
    size: stats.size,
    created_at: stats.birthtime,
    modified_at: stats.mtime,
  });
};

const spec = {
  name: "file-info",
  description: "Retrieves metadata about a file or directory.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to the file or directory. It can either be absolute or relative to the current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = { impl, spec };
