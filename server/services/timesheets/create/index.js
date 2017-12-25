const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async (params) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(params);
  if (!isNeedCreateTimesheet) {
    throw new Error(`Some timesheet already exists on date ${params.onDate}`);
  }

  //TODO fix typeId type on front
  const isNeedUpdateTask = params.taskId
    && parseInt(params.typeId) === models.TimesheetTypesDictionary.IMPLEMENTATION;

  const updatedTask = isNeedUpdateTask
    ? await updateTask(params)
    : null;

  const timesheet = await models.Timesheet.create(params);
  const timesheetWithTask = await queries.timesheet.getTimesheet({ id: timesheet.id });
  timesheetWithTask.dataValues.isDraft = false;

  return {
    createdTimesheet: transformTimesheet(timesheetWithTask),
    updatedTask: updatedTask[1][0].dataValues
  };
};

async function updateTask (params) {
  const task = await queries.task.findOneActiveTask(params.taskId, ['id', 'factExecutionTime']);

  return await models.Task.update({
    factExecutionTime: models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`)
  }, {
    where: { id: task.id },
    returning: true
  });
}

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
