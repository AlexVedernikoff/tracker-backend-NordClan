const checkExternalUsers = require('/home/inna/projects/track-back/cronjobs/checkExternalUsersScript/checkExternalUsers');
const logger = require('/home/inna/projects/track-back/cronjobs/logger')(module);


test();

async function test () {
  try {
    await checkExternalUsers();
  } catch (e) {
    logger.error(e);
  }
}

