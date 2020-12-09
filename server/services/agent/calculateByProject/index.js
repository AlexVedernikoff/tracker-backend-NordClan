const { exec } = require('child_process');
const emailSubprocess = require('../../../services/email/subprocess');
const models = require('../../../models');
const config = require('../../../configs');

const recipientsEmails = config.emailsToSendErrorsByMetrics;

module.exports.calculateByProject = async function (projectId, user) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    exec(`node ./server/services/agent/calculateByProject/agent.js ${projectId}`, (error, stdout, stderr) => {
      if (error) {
        emailSubprocess({
          eventId: models.ProjectEventsDictionary.values[5].id,
          input: {
            recipients: recipientsEmails,
            error: error,
            projectId: projectId,
          },
          user,
        });
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};
