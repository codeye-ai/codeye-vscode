async function impl({ name }) {
  const value = process.env[name] || null;
  return JSON.stringify({ success: true, value });
}

const spec = {
  name: "get-env-var",
  description: "Gets the value of an environment variable by its name.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the environment variable.",
      },
    },
    required: ["name"],
  },
};

module.exports = {
  impl,
  spec,
};
