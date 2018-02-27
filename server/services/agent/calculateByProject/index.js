const { exec } = require('child_process');

module.exports.calculateByProject = async function (projectId) {
  return new Promise((resolve, reject) => {
    exec(`node ./server/services/agent/calculateByProject/agent.js ${projectId}`, (error, stdout, stderr) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });
};
