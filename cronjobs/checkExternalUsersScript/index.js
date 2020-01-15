const checkExternalUsers = require('./checkExternalUsers');
const logger = require('../logger')(module);

(async function checkExternalUserScript () {
  try {
    checkExternalUsers();
  } catch (e) {
    logger.error(e);
  }

  logger.info('Done!');
}());
