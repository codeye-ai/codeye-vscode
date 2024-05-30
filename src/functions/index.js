const deleteFile = require("./detete-file");
const exitProcess = require("./exit-process");
const listFiles = require("./list-files");
const readFile = require("./read-file");
const runCommand = require("./run-command");
const stopProcess = require("./stop-process");
const writeFile = require("./write-file");

module.exports = {
  [deleteFile.spec.name]: deleteFile,
  [exitProcess.spec.name]: exitProcess,
  [listFiles.spec.name]: listFiles,
  [readFile.spec.name]: readFile,
  [runCommand.spec.name]: runCommand,
  [stopProcess.spec.name]: stopProcess,
  [writeFile.spec.name]: writeFile,
};
