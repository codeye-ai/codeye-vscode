const { exec } = require("child_process");

async function impl({ name }) {
  const command = process.platform === "win32" ? "where" : "which";

  return new Promise((resolve) => {
    exec(`${command} ${name}`, (error, stdout) => {
      if (error) {
        resolve(JSON.stringify({ success: false }));
      } else {
        resolve(JSON.stringify({ success: true, path: stdout.trim() }));
      }
    });
  });
}

const spec = {
  name: "find_executable_path",
  description:
    "Finds the absolute path to an executable using the 'which' or 'where' command depending on the OS.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the executable to find.",
      },
    },
    required: ["name"],
  },
};

module.exports = {
  impl,
  spec,
};
