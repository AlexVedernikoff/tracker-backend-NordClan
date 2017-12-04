const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.destroy = async (timesheetIds, userId) => {
  const transaction = await Sequelize.transaction();

  try {
    const deletedTimesheets = await Promise.all(timesheetIds
      .map(async (id) => await destroyTimesheet(id, userId, transaction)));

    transaction.commit();
    return deletedTimesheets.filter(timesheet => timesheet);
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};

async function destroyTimesheet (id, userId, transaction) {
  const timesheetModel = await queries.timesheet.canUserChangeTimesheet(userId, id);

  if (timesheetModel.taskId && timesheetModel.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
    const task = await queries.task.findOneActiveTask(timesheetModel.taskId, ['id', 'factExecutionTime'], transaction);
    const factExecutionTime = models.sequelize.literal(`"fact_execution_time" - ${timesheetModel.spentTime}`);
    await models.Task.update({ factExecutionTime }, { where: { id: task.id }, transaction });
  }

  await timesheetModel.destroy({transaction});

  return timesheetModel;
}
