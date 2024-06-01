const path = require("path");
const vscode = require("vscode");

const script = path.join(__dirname, "cli.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("codeye.startSession", function () {
      const terminal = vscode.window.createTerminal("Codeye", "node", [script]);
      terminal.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codeye.startSessionAfresh", function () {
      const terminal = vscode.window.createTerminal("Codeye", "node", [
        script,
        "--reset",
      ]);
      terminal.show();
    }),
  );

  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider("codeye.terminalProfile", {
      provideTerminalProfile(token) {
        return {
          options: {
            name: "Codeye",
            shellPath: "node",
            shellArgs: [script, "--reset"],
          },
        };
      },
    }),
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
