const moment = require('moment');
const models = require('../server/models');
const logger = require('./logger')(module);


(async function deleteDrafts () {
  try {
    await models.TimesheetDraft.destroy({
      where: {
        onDate: {
          $lt: moment().subtract(8, 'days').format() // onDate < now - 8 days
        }
      },
      force: true
    });
    logger.info('Done');
  } catch (e) {
    logger.error(e);
  }
}());
