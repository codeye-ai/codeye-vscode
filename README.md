# codeye

CLI tool to read, fix, and write code as good as or even better than a human software engineer.

## Install

Clone the repository, navigate to project folder and run below commands:

```shell
# use a supported node.js version
nvm install && nvm use

# install node.js dependencies
yarn install

# install "codeye" executable globally
npm link
```

## Usage

Go to [platform.openai.com](https://platform.openai.com/) and create an API key. From there, make note of your organization ID as well.

Set values for below environment in your shell using `.{bash,zsh}rc` scripts by including lines below:

```shell
export CODEYE_OPENAI_API_KEY=__your_openai_api_key__
export CODEYE_OPENAI_ORGANIZATION=__your_openai_organization_id__
```

Then you can use the tool in any folder using below commands:

```shell
# start new or restore existing session
codeye

# start fresh session (no context/history)
codeye --reset
```

## Development

Use below command to run working copy of the tool:

```shell
node .
```
