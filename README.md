# Codeye

Codeye is a code generation tool designed to write quality code/software using OpenAI's API. It determines the project type by listing and reading files in the current directory and assists users accordingly.

## Prerequisites

- Node.js (as specified in `.nvmrc`)
- Yarn (or npm)
- OpenAI API Key

## Getting Started

1. **Clone the repository**:

   ```sh
   git clone https://github.com/vaibhavpandeyvpz/codeye.git
   cd codeye
   ```

2. **Install dependencies**:

   ```sh
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**:

   Copy `.env.dist` to `.env` and replace the placeholder values with your OpenAI API key and Organization ID.

   ```sh
   cp .env.dist .env
   nano .env
   ```

   Update the file with your values:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_ORGANIZATION=your_organization_id_here
   ```

4. **Run the tool**:

   ```sh
   node index.js
   ```

## Project Structure

- `.env`, `.env.dist`: Environment variable definitions.
- `.gitignore`: Specifies files and directories to be ignored by git.
- `.nvmrc`: Node version manager configuration.
- `index.js`: Main entry point of the application. Loads environment and starts code generation.
- `package.json`: Project metadata and dependencies.
- `yarn.lock`: Yarn lockfile for package versions.
- `src/`: Source code directory.
  - `codeye.js`: Implements the core code generation logic.
  - `features/history.js`: Handles loading and saving of history data.
  - `functions/`: Directory containing various utility functions.

## Utility Functions

- `delete-file.js`: (missing) Deletes a file from the file system.
- `exit-process.js`: Exits the current process.
- `list-files.js`: Lists files and directories.
- `read-file.js`: Reads the contents of a file.
- `run-command.js`: Runs shell commands.
- `stop-process.js`: Stops running processes.
- `write-file.js`: Writes text content to a file.

## License

This project is licensed under the MIT License.
