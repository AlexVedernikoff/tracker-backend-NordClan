const models = require('../../../models');
const { Task, Timesheet, TimesheetDraft } = models;
const queries = require('../../../models/queries');

exports.updateDraft = async (params, draftId, userId) => {
  const updatedDraft = !params.spentTime
    ? await updateDraft(params, draftId)
    : null;

  const createdTimesheet = params.spentTime
    ? await createTimesheet(params, draftId, userId)
    : {};

  return { updatedDraft, createdTimesheet };
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
  const timesheetParams = await getTimesheetParams(params, draftId, userId);

  const timesheet = await Timesheet.create(timesheetParams, { returning: true });
  const createdTimesheet = await queries.timesheet.getTimesheet(timesheet.id);

  if (!isDraftForMagicActivity(draftId)) {
    await TimesheetDraft.destroy({ where: { id: draftId } });
  }

  return transformTimesheet(createdTimesheet);
}

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues });
    delete timesheet.dataValues.projectMaginActivity;
  }

  timesheet.dataValues.onDate = timesheet.onDate;
  timesheet.dataValues.isDraft = false;
  timesheet.dataValues.task = timesheet.dataValues.task.dataValues;
  return timesheet.dataValues;
}


async function getTimesheetParams (params, draftId, userId) {
  if (isDraftForMagicActivity(draftId)) {
    delete params.id;
    return { ...params, userId };
  }

  const draft = await TimesheetDraft.findById(draftId);

  const { onDate, typeId, taskStatusId, taskId, projectId, isVisible } = draft.dataValues;

  const timesheetParams = {
    sprintId: params.sprintId,
    onDate,
    isVisible,
    typeId,
    taskStatusId,
    userId,
    taskId,
    projectId,
    spentTime: params.spentTime
  };
  return timesheetParams;
}

function isDraftForMagicActivity (draftId) {
  return typeof draftId === 'string';
}
