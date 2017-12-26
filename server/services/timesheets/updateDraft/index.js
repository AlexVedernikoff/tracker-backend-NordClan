const models = require('../../../models');
const { Task, Timesheet, TimesheetDraft } = models;
const queries = require('../../../models/queries');

exports.updateDraft = async (params, draftId, userId) => {
  const updatedDraft = !params.spentTime
    ? await updateDraft(params, draftId)
    : null;

  const { createdTimesheet, updatedTask } = params.spentTime
    ? await createTimesheet(params, draftId, userId)
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

async function createTimesheet (params, draftId, userId) {
  const { timesheetParams, draft, updatedTask } = await getTimesheetParams(params, draftId, userId);

  console.log(timesheetParams);
  const timesheet = await Timesheet.create(timesheetParams, { returning: true });
  const createdTimesheet = await queries.timesheet.getTimesheet(timesheet.id);

  if (!isDraftForMagicActivity(draftId)) {
    await TimesheetDraft.destroy({ where: { id: draftId } });
  }

  return {
    createdTimesheet: transformTimesheet(createdTimesheet),
    updatedTask
  };
}

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues, isDraft: false });
    delete timesheet.dataValues.projectMaginActivity;
  }
  timesheet.dataValues.onDate = timesheet.onDate;
  return timesheet.dataValues;
}


async function getTimesheetParams (params, draftId, userId) {
  if (isDraftForMagicActivity(draftId)) {
    delete params.id;
    return {
      timesheetParams: {
        ...params,
        userId
      }
    };
  } else {
    const draft = await TimesheetDraft.findById(draftId);
    const updatedTask = await getUpdatedTask(draft, params);

    const { onDate, typeId, taskStatusId, taskId } = draft.dataValues;

    const timesheetParams = {
      onDate,
      typeId,
      taskStatusId,
      userId,
      taskId,
      spentTime: params.spentTime
    };

    return { updatedTask, timesheetParams };
  }
}

function isDraftForMagicActivity (draftId) {
  return typeof draftId === 'string';
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
