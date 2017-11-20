const moment = require('moment');
const createDraftsService = require('./service');

createDrafts();

async function createDrafts () {
  try {
    const onDate = moment().format('YYYY-MM-DD');
    await createDraftsService().call(onDate);
    console.info('Done!');
  } catch (e) {
    console.error(e);
  }
}
