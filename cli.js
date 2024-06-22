#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv))
  .option("file", {
    alias: "f",
    type: "string",
    description: "Path to current/active file (e.g., in the editor).",
  })
  .option("reset", {
    alias: "r",
    type: "boolean",
    description: "Resets the conversation history.",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Enables verbose output.",
  })
  .parse();

const { main } = require("./src/codeye");

main(argv.file, !!argv.reset, !!argv.verbose);
