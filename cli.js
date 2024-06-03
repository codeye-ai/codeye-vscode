#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv))
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

const { generate } = require("./src/codeye");

generate(!!argv.reset, !!argv.verbose);
