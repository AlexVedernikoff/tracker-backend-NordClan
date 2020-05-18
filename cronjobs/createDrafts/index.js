const moment = require('moment');
const createDraftsService = require('./service');
const logger = require('../logger')(module);

(async function createDrafts () {
  const onDate = moment().format('YYYY-MM-DD');
  try {
    await createDraftsService().call(onDate);
  } catch (e) {
    logger.error(e);
  }
  logger.info('Done!');
}());
