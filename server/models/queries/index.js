const fs = require('fs');
const path = require('path');

// Часто используемые запросы к бд
const queryFunctions = {};
fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function (file) {
    const queryFile = require(path.join(__dirname, file));
    queryFunctions[queryFile.name] = queryFile;
  });
module.exports = queryFunctions;
