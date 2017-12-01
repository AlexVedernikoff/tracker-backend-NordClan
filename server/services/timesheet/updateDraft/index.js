const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.updateDraft = async function (params, draftId, userId) {
  if (params.spentTime) {
    const createdTimesheet = await createTimesheet(params, draftId);
    return { action: 'created timesheet', data: createdTimesheet };
  }

  const updatedDraft = await updateDraft(params, draftId, userId);
  return { action: 'updated draft', data: updatedDraft };
};

async function createTimesheet (params, draftId) {
  const transaction = await Sequelize.transaction();

  const draft = await queries.timesheetDraft.findDraft({id: draftId, deletedAt: null});
  updateTaskTime(draft, params, transaction);

  const needCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(draft);
  if (!needCreateTimesheet) {
    await transaction.rollback();
    throw new Error(`Some timesheet already exists on date ${draft.onDate}`);
  }

  const timesheetParams = Object
    .entries(draft.dataValues)
    .filter(([k, _]) => k !== 'id')
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

  await models.Timesheet.create({...timesheetParams, spentTime: params.spentTime}, { transaction });
  await models.TimesheetDraft.destroy({ where: { id: draft.id }, transaction });

  await transaction.commit();

  const where = {
    taskId: draft.taskId,
    onDate: draft.onDate,
    deletedAt: null
  };

  const task = await queries.timesheet.findOne(where);
  return task;
}

async function updateTaskTime (draft, params, transaction) {
  const task = await queries.task.findOneActiveTask(draft.taskId, ['id', 'factExecutionTime'], transaction);
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + (${params.spentTime} - ${draft.spentTime})`);
  await models.Task.update({ factExecutionTime }, { where: { id: task.dataValues.id }, transaction });
}

async function updateDraft (params, draftId, userId) {
  await models.TimesheetDraft.update(params, { where: { id: draftId }});
  const updatedDraft = await queries.timesheetDraft.findDraftSheet(userId, draftId);
  return updatedDraft;
}
