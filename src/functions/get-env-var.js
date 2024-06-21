async function impl({ name }) {
  const value = process.env[name] || "";
  return JSON.stringify({ value });
}

const spec = {
  name: "get_env_var",
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
