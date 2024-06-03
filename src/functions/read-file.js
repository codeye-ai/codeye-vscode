const fs = require("fs");
const { lookup } = require("mime-types");

async function impl({ path }) {
  if (!fs.existsSync(path)) {
    return `File ${path} does not exist.`;
  }

  const mime = lookup(path) || "unknown";
  if (mime.startsWith("image/")) {
    const contents = fs.readFileSync(path, { encoding: "base64" });

    return [
      {
        type: "text",
        text: `File ${path} appears to be an image. Please upload image.`,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${mime};base64,${contents}`,
        },
      },
    ];
  }

  return fs.readFileSync(path, { encoding: "utf-8" });
}

const spec = {
  name: "read-file",
  description:
    "Reads contents of a (image or text) file and returns it as string.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path to file. It can either be absolute or relative to current directory.",
      },
    },
    required: ["path"],
  },
};

module.exports = {
  impl,
  spec,
};
