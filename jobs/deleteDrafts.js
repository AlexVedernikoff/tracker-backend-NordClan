const moment = require('moment');
const models = require('../server/models');

deleteDrafts();

async function deleteDrafts () {
  try {
    await models.TimesheetDraft.destroy({
      where: {
        onDate: {
          $lt: moment().subtract(8, 'days').format() // onDate < now - 8 days
        }
      },
      force: true
    });
    console.info('Done');
  } catch (e) {
    console.error(e);
  }
}
