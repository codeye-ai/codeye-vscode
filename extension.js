const path = require("path");
const vscode = require("vscode");

const script = path.join(__dirname, "cli.build.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("codeye.startSession", function () {
      const terminal = vscode.window.createTerminal(create());
      terminal.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codeye.startSessionAfresh", function () {
      const terminal = vscode.window.createTerminal(create(["--reset"]));
      terminal.show();
    }),
  );

  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider("codeye.terminalProfile", {
      provideTerminalProfile() {
        return {
          options: create(),
        };
      },
    }),
  );
}

function create(args = []) {
  const codeye = vscode.workspace.getConfiguration("codeye");

  return {
    env: {
      ...process.env,
      CODEYE_GEMINI_API_KEY: codeye.get("geminiApiKey"),
      CODEYE_OPENAI_API_KEY: codeye.get("openAiApiKey"),
      CODEYE_OPENAI_ORGANIZATION: codeye.get("openAiOrganization"),
      CODEYE_AI_MODEL: codeye.get("aiModel"),
    },
    name: "Codeye",
    shellPath: "node",
    shellArgs: [script, ...args],
  };
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
