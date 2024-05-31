async function impl() {
  return "Closed prompt and exited successfully.";
}

const spec = {
  name: "exit-process",
  description:
    "Exits the current process. To be used when user is done interacting with the tool.",
  parameters: {
    type: "object",
    properties: {},
  },
};

module.exports = {
  impl,
  spec,
};
