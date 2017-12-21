const models = require('../../../models');
const { Task, Timesheet, TimesheetDraft } = models;
const queries = require('../../../models/queries');

exports.updateDraft = async (params, draftId) => {
  const draft = await TimesheetDraft.findById(draftId);
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

  await Timesheet.create(timesheetParams);
  await TimesheetDraft.destroy({ where: { id: draft.id } });

  const createdTimesheet = await queries.timesheet.getTimesheet(timesheetParams);

  return { createdTimesheet, updatedTask };
};

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
