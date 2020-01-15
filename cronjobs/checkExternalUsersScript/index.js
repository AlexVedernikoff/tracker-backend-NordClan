const checkExternalUsers = require('./checkExternalUsers');
const logger = require('../logger')(module);

(async function checkExternalUserScript () {
  try {
    await checkExternalUsers().call();
  } catch (e) {
    logger.error(e);
  }

  logger.info('Done!');
}());
