async function impl() {
  process.exit(0);
}

const spec = {
  name: "exit-process",
  description: "Exits the current process.",
  parameters: {
    type: "object",
    properties: {},
  },
};

module.exports = {
  impl,
  spec,
};
