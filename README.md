# Codeye - AI-Powered Developer CLI

Codeye is a revolutionary [Visual Studio Code](https://code.visualstudio.com/) extension and CLI that transforms your coding experience. Designed to boost developer productivity by 10x, Codeye can generate entire software projects, install developer tools, manage servers, and much more—all from simple text prompts.

![Screenshot](https://raw.githubusercontent.com/codeye-ai/codeye-vscode/main/images/usage.png)

## Features

- **AI-Powered Code Generation**: Generate code snippets or entire projects effortlessly.
- **Automated Software Installation**: Quickly set up developer tools and environments.
- **Server Management**: Easily deploy and manager stack, servers across languages.
- **Seamless Integration**: Works directly within your favorite code editor, [Visual Studio Code](https://code.visualstudio.com/).

## Getting Started

## How to Use

There are many ways you could launch **Codeye** once installed.

### From Command Palette

1. **Install Codeye**: Search for **Codeye** in the [Visual Studio Code](https://code.visualstudio.com/) **Extensions** tab or visit the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codeye.codeye) for quick installation.
2. **Select AI Model**: Navigate to `Settings` > `Extensions` > `Codeye` and choose you desired AI model.
3. **Enter Credentials**: Enter your [Anthropic](https://www.anthropic.com), [Google AI Studio](https://ai.google.dev) or [OpenAI](https://openai.com/) credentials based on the selected model.
4. Hit `CMD + SHIFT + P` and start a **Codeye** session from the **Command Palette**.

![Command](https://raw.githubusercontent.com/codeye-ai/codeye-vscode/main/images/command-palette.png)

### From Terminal

Install and configure as global CLI command from [npm](https://www.npmjs.com/package/codeye):

```shell
# install package as global
npm i -g codeye

# configure model and credentials (only once)
codeye configure
```

Then in any folder, start a session using below command:

```shell
codeye chat
```

## Development

Clone the repository, navigate to project folder and run below commands:

```shell
# use a supported node.js version
nvm install && nvm use

# install node.js dependencies
yarn install

# create a .env file
cp .env.dist .env

# update values in .env
```

To run as [Visual Studio Code](https://code.visualstudio.com) extension, open the project is [Visual Studio Code](https://code.visualstudio.com) and hit `F5` to start a new [Visual Studio Code](https://code.visualstudio.com) window with this extension preloaded.

![Terminal Profile](https://raw.githubusercontent.com/codeye-ai/codeye-vscode/main/images/terminal-profile.png)

Or use below command to run working copy of the tool:

```shell
npm run debug -- chat
```

## Publishing

Before publishing, package your extension as `vsix` file.

```shell
npx vsce package
```

To publish to [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codeye.codeye), use below commands:

```shell
npx vsce publish
```

## Disclaimer

This is an experimental tool currently in its Early Access Program (EAP). Your feedback is incredibly valuable for shaping its future.
