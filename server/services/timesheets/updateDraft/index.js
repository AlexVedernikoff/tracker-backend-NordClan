const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.updateDraft = async function (params, draftId) {
  const createdTimesheet = await createTimesheet(params, draftId);
  return createdTimesheet;
};

async function createTimesheet (params, draftId) {
  const transaction = await Sequelize.transaction();

  const draft = await queries.timesheetDraft.findDraft({id: draftId});
  updateTaskTime(draft, params, transaction);

  const needCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(draft);
  if (!needCreateTimesheet) {
    await transaction.rollback();
    throw new Error(`Some timesheet already exists on date ${draft.onDate}`);
  }

  const timesheetParams = Object
    .entries(draft.dataValues)
    .reduce((acc, [key, value]) => {
      if (key !== 'id') {
        acc[key] = value;
      }
      return acc;
    }, {});

  await models.Timesheet.create({...timesheetParams, spentTime: params.spentTime}, { transaction });
  await models.TimesheetDraft.destroy({ where: { id: draft.id }, transaction });

  await transaction.commit();

  const where = {
    taskId: draft.taskId,
    onDate: draft.onDate
  };

  const task = await queries.timesheet.findOne(where);
  return task;
}

async function updateTaskTime (draft, params, transaction) {
  const task = await queries.task.findOneActiveTask(draft.taskId, ['id', 'factExecutionTime'], transaction);
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`);
  await models.Task.update({ factExecutionTime }, { where: { id: task.dataValues.id }, transaction });
}
