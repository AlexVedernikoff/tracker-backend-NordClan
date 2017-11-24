const moment = require('moment');
const createDraftsService = require('./service');

(async function createDrafts () {
  const onDate = moment().format('YYYY-MM-DD');
  try {
    await createDraftsService().call(onDate);
  } catch (e) {
    console.error(e);
  }
  console.info('Done!');
}());
