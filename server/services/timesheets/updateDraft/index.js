const models = require('../../../models');
const { Task, Timesheet, TimesheetDraft } = models;
const queries = require('../../../models/queries');

exports.updateDraft = async (params, draftId) => {
  const draft = await TimesheetDraft.findById(draftId);
  const updatedDraft = !params.spentTime
    ? await updateDraft(params, draftId)
    : null;

  const { createdTimesheet, updatedTask } = params.spentTime
    ? await createTimesheet(draft, params)
    : {};

  return { updatedDraft, createdTimesheet, updatedTask };
};

async function updateDraft (params, draftId) {
  const updatedDraft = await TimesheetDraft.update(params, {
    where: { id: draftId },
    returning: true
  });

  return {
    ...updatedDraft[1][0].dataValues,
    isDraft: true
  };
}

async function createTimesheet (draft, params) {
  const updatedTask = await getUpdatedTask(draft, params);

  const { onDate, typeId, taskStatusId, userId, taskId } = draft.dataValues;

  const timesheetParams = {
    onDate,
    typeId,
    taskStatusId,
    userId,
    taskId,
    spentTime: params.spentTime
  };

  const timesheet = await Timesheet.create(timesheetParams, { returning: true });
  const createdTimesheet = await queries.timesheet.getTimesheet(timesheet.id);

  await TimesheetDraft.destroy({ where: { id: draft.id } });

  return {
    createdTimesheet: createdTimesheet,
    updatedTask
  };
}

async function getUpdatedTask (draft, params) {
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`);
  const updatedTask = await Task.update({ factExecutionTime }, {
    where: { id: draft.taskId },
    returning: true
  });

  return {
    id: updatedTask[1][0].dataValues.id,
    projectId: updatedTask[1][0].dataValues.projectId,
    factExecutionTime: updatedTask[1][0].dataValues.factExecutionTime
  };
}
