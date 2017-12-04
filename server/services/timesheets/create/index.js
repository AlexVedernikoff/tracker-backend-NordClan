const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async (params) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(params);
  if (!isNeedCreateTimesheet) {
    throw new Error(`Some timesheet already exists on date ${params.onDate}`);
  }

  const transaction = await Sequelize.transaction();

  const isNeedUpdateTask = params.taskId
    && params.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION;

  if (isNeedUpdateTask) {
    const task = await queries.task.findOneActiveTask(params.taskId,
      ['id', 'factExecutionTime'],
      transaction);

    await models.Task.update({
      factExecutionTime: models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`)
    }, {
      where: { id: task.id },
      transaction
    });
  }

  const timesheet = await models.Timesheet.create(params, {
    transaction
  });

  await transaction.commit();
  const timesheetWithTask = await queries.timesheet.getTimesheet(timesheet.id);
  timesheetWithTask.dataValues.isDraft = false;

  return timesheetWithTask;
};
