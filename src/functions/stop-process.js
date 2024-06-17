const { processes } = require("./run-command");

async function impl({ pid }) {
  const process = processes.get(pid);
  if (!process) {
    return `No process found with PID: ${pid}`;
  }

  process.kill("SIGTERM");
  processes.delete(pid);
  return `Stopped process with PID: ${pid}`;
}

const spec = {
  name: "stop_process",
  description: "Stops a running process using the given process ID.",
  parameters: {
    type: "object",
    properties: {
      pid: {
        type: "number",
        description: "Process ID of the running process to stop.",
      },
    },
    required: ["pid"],
  },
};

module.exports = {
  impl,
  spec,
};
