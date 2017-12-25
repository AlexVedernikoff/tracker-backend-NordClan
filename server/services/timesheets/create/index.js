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
  const timesheetWithTask = await queries.timesheet.getTimesheet({ id: timesheet.id });
  timesheetWithTask.dataValues.isDraft = false;

  return transformTimesheet(timesheetWithTask);
};

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.task && timesheet.dataValues.task.dataValues.project) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.task.dataValues.project, isDraft: false });
    delete timesheet.dataValues.task.dataValues.project;
  }
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues, isDraft: false });
    delete timesheet.dataValues.projectMaginActivity;
  }
  timesheet.dataValues.onDate = timesheet.onDate;
  return timesheet.dataValues;
}
