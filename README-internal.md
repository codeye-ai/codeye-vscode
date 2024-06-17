# codeye

[Visual Studio Code](https://code.visualstudio.com) extension and CLI tool to read, fix, and write code as good as or even better than a human software engineer.

## Install

Clone the repository, navigate to project folder and run below commands:

```shell
# use a supported node.js version
nvm install && nvm use

# install node.js dependencies
yarn install
```

## Usage

To run as [Visual Studio Code](https://code.visualstudio.com) extension, open the project is [Visual Studio Code](https://code.visualstudio.com) and hit `F5` to start a new [Visual Studio Code](https://code.visualstudio.com) window with this extension preloaded.

## Development

Use below command to run working copy of the tool:

```shell
node cli.js
```

## Publishing

Before publishing, make sure to install the `vsce` CLI, if not already:

```shell
npm install -g @vscode/vsce
```

Then package your extension as `vsix` file.

```shell
npx vsce package --allow-missing-repository --skip-license
```

To publish to [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codeye.codeye), use below commands:

```shell
npx vsce publish
```
