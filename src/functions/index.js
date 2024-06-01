const createDirectory = require("./create-directory");
const deleteDirectory = require("./delete-directory");
const deleteFile = require("./delete-file");
const findExecutablePath = require("./find-executable-path");
const getEnvVar = require("./get-env-var");
const listFiles = require("./list-files");
const listFilesRecursively = require("./list-files-recursively");
const moveFile = require("./move-file");
const readFile = require("./read-file");
const runCommand = require("./run-command");
const stopProcess = require("./stop-process");
const writeFile = require("./write-file");

module.exports = {
  [createDirectory.spec.name]: createDirectory,
  [deleteDirectory.spec.name]: deleteDirectory,
  [deleteFile.spec.name]: deleteFile,
  [findExecutablePath.spec.name]: findExecutablePath,
  [getEnvVar.spec.name]: getEnvVar,
  [listFiles.spec.name]: listFiles,
  [listFilesRecursively.spec.name]: listFilesRecursively,
  [moveFile.spec.name]: moveFile,
  [readFile.spec.name]: readFile,
  [runCommand.spec.name]: runCommand,
  [stopProcess.spec.name]: stopProcess,
  [writeFile.spec.name]: writeFile,
};
