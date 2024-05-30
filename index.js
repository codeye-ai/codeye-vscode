const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { generate } = require("./src/codeye");

generate();
