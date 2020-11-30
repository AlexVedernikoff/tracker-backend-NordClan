const models = require('../../../models');
const queries = require('../../../models/queries');

exports.destroy = async (timesheetIds, userId) => {
  const deletedTimesheets = await Promise.all(timesheetIds
    .map(async (id) => await destroyTimesheet(id, userId)));

  return deletedTimesheets
    .filter(deletedTimesheet => deletedTimesheet);
};

async function destroyTimesheet (id, userId) {
  const deletedTimesheet = await queries.timesheet.canUserChangeTimesheet(userId, id);

  await deletedTimesheet.destroy();

  return deletedTimesheet;
}
