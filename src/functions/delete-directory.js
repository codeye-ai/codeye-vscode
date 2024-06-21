const fs = require("fs");
const path = require("path");

async function impl({ path: dir }) {
  const cwd = process.cwd();
  const absolute = path.resolve(dir);

  if (!absolute.startsWith(cwd)) {
    return JSON.stringify({
      success: false,
      error: "Path is outside the current working directory.",
    });
  }

  function recursive(dir) {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
        const current = path.join(dir, file.name);
        if (file.isDirectory()) {
          recursive(current);
        } else {
          fs.unlinkSync(current);
        }
      });
      fs.rmdirSync(dir);
    }
  }

  recursive(absolute);
  return JSON.stringify({ success: true });
}

const spec = {
  name: "delete_directory",
  description: "Recursively deletes a directory and its contents.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to the directory to delete. Must be within the current working directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
