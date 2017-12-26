const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async (params) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(params);
  if (!isNeedCreateTimesheet) {
    throw new Error(`Some timesheet already exists on date ${params.onDate}`);
  }

  //TODO с фронта приходит typeId и как строка и как число
  const isNeedUpdateTask = params.taskId
    && parseInt(params.typeId) === models.TimesheetTypesDictionary.IMPLEMENTATION;

  const updatedTask = isNeedUpdateTask
    ? await updateTask(params)
    : null;

  const { id } = await models.Timesheet.create(params);
  const createdTimesheet = await queries.timesheet.getTimesheet({ id });
  createdTimesheet.isDraft = false;

  return {
    createdTimesheet: transformTimesheet(createdTimesheet),
    updatedTask
  };
};

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues, isDraft: false });
    delete timesheet.dataValues.projectMaginActivity;
  }
  timesheet.dataValues.onDate = timesheet.onDate;
  return timesheet.dataValues;
}

async function updateTask (params) {
  const task = await queries.task.findOneActiveTask(params.taskId, ['id', 'factExecutionTime']);

  const updatedTask = await models.Task.update({
    factExecutionTime: models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`)
  }, {
    where: { id: task.id },
    returning: true
  });

  return updatedTask[1][0].dataValues;
}
