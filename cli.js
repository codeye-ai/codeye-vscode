#!/usr/bin/env node
"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const prompts = require("prompts");
const { main } = require("./src/codeye");
const { load, save } = require("./src/utils/persistence");

const MODEL_IDS = [
  "claude-3-5-sonnet-20240620",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro-001",
  "gpt-3.5-turbo",
  "gpt-4o",
  "gpt-4o-mini",
  "o1-preview",
  "o1-mini",
];

const MODEL_NAMES = [
  "Claude 3.5 Sonnet",
  "Gemini 1.5 Flash",
  "Gemini 1.5 Pro",
  "GPT-3.5 Turbo",
  "GPT-4o",
  "GPT-4o Mini",
  "O1 Preview",
  ,
  "O1 Mini",
];

yargs(hideBin(process.argv))
  .command("configure", "configure settings", async (argv) => {
    const settings = await load(null, "settings", "json");
    const response = await prompts([
      {
        type: "select",
        name: "model",
        message: "Pick an LLM",
        choices: MODEL_IDS.map((x, i) => ({
          title: MODEL_NAMES[i],
          value: x,
        })),
        initial: MODEL_IDS.indexOf(settings?.model || MODEL_IDS[0]),
      },
      {
        type: (prev, values) =>
          values.model.indexOf("claude") === 0 ? "text" : null,
        name: "apiKey",
        message: "Anthropic API key",
        initial: settings?.apiKey,
        validate: (value) =>
          value.indexOf("sk-ant-") === 0
            ? true
            : "This must be a valid Anthropic API key.",
      },
      {
        type: (prev, values) =>
          values.model.indexOf("gemini") === 0 ? "text" : null,
        name: "apiKey",
        message: "Gemini API key",
        initial: settings?.apiKey,
      },
      {
        type: (prev, values) =>
          values.model.indexOf("gpt") === 0 || values.model.indexOf("o1") === 0
            ? "text"
            : null,
        name: "apiKey",
        message: "OpenAI API key",
        initial: settings?.apiKey,
        validate: (value) =>
          value.indexOf("sk-") === 0
            ? true
            : "This must be a valid OpenAI API key.",
      },
      {
        type: (prev, values) =>
          values.model.indexOf("gpt") === 0 ? "text" : null,
        name: "organization",
        message: "OpenAI organization",
        initial: settings?.organization,
        validate: (value) =>
          value.indexOf("org-") === 0
            ? true
            : "This must be a valid OpenAI organization ID.",
      },
    ]);

    if (response.model && response.apiKey) {
      await save(null, response, "settings", "json");
    }
  })
  .command(
    "chat",
    "start a chat",
    (yargs) => {
      return yargs
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
        });
    },
    async (argv) => {
      await main(argv.file, !!argv.reset, !!argv.verbose);
    },
  )
  .scriptName("codeye")
  .strictCommands()
  .demandCommand(1)
  .parse();
