const models = require('../../../models');
const queries = require('../../../models/queries');

exports.destroy = async (timesheetIds, userId) => {
  const deletedTimesheets = await Promise.all(timesheetIds
    .map(async (id) => await destroyTimesheet(id, userId)));

  return deletedTimesheets
    .filter(({ deletedTimesheet }) => deletedTimesheet);
};

async function destroyTimesheet (id, userId) {
  const deletedTimesheet = await queries.timesheet.canUserChangeTimesheet(userId, id);

  const needUpdateTask = deletedTimesheet.taskId
    && deletedTimesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION;

  const updatedTask = needUpdateTask
    ? await updateTask(deletedTimesheet)
    : null;

  await deletedTimesheet.destroy();

  return { deletedTimesheet, updatedTask };
}

async function updateTask (timesheet) {
  const task = await queries.task.findOneActiveTask(timesheet.taskId, ['id', 'factExecutionTime']);
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" - ${timesheet.spentTime}`);
  const updatedTask = await models.Task.update({ factExecutionTime }, {
    where: { id: task.id },
    returning: true
  });

  return updatedTask[1][0].dataValues;
}
