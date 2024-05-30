const { exec, spawn } = require("child_process");

const processes = new Map();

async function impl({ command, background = false }) {
  if (background) {
    const process = spawn(command, { shell: true, detached: true });
    const pid = process.pid;
    processes.set(pid, process);
    return JSON.stringify({ success: true, pid });
  }

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve(JSON.stringify({ success: !error, stdout, stderr }));
    });
  });
}

const spec = {
  name: "run-command",
  description: "Runs a shell command in a child process and returns output.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "Full command line, including any arguments (if required).",
      },
      background: {
        type: "boolean",
        description:
          "Run the process in the background (for long running commands e.g., servers etc.) and return process ID.",
        default: false,
      },
    },
    required: ["command"],
  },
};

module.exports = {
  impl,
  processes, // Export processes map for external use
  spec,
};
