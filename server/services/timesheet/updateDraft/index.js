const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');
const moment = require('moment');

exports.updateDraft = async function (params, draftId, userId) {
  if (params.spentTime) {
    const createdTimesheet = await createTimesheet(params, draftId);
    return { action: 'created timesheet', data: createdTimesheet };
  }

  const updatedDraft = await updateDraft(params, draftId);
  return { action: 'updated draft', data: updatedDraft };
};

async function updateDraft (params, draftId, userId) {
  await models.TimesheetDraft.update(params, { where: { id: draftId }});
  const updatedDraft = await queries.timesheetDraft.findDraftSheet(userId, draftId);
  return updatedDraft;
}

async function createTimesheet (params, draftId) {
  const transaction = await Sequelize.transaction();
  const drafts = await getDrafts({id: draftId});
  const draft = drafts[0];

  await models.TimesheetDraft.destroy({ where: { id: draftId }, transaction });

  const task = await queries.task.findOneActiveTask(draft.taskId, ['id', 'factExecutionTime'], transaction);
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + (${params.spentTime} - ${draft.spentTime})`);
  await models.Task.update({ factExecutionTime }, { where: { id: task.dataValues.id }, transaction });

  const needCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(draft);
  if (!needCreateTimesheet) {
    await transaction.rollback();
    throw new Error(`Some timesheet already exists on date ${draft.onDate}`);
  }

  const timesheet = await models.Timesheet.create({...draft, spentTime: params.spentTime}, { transaction });
  // const extensibleTimesheet = await queries.timesheet.getTimesheet(timesheet.id);
  const extensibleTimesheets = await getTimesheets({id: timesheet.id});
  console.log(extensibleTimesheets);
  const extensibleTimesheet = extensibleTimesheets[0];

  await transaction.commit();

  return extensibleTimesheet;
}

async function getTimesheets (conditions) {
  const queryParams = getConditions(conditions);
  const timesheets = await queries.timesheet.all(queryParams);
  return timesheets.map(timesheet => transformTimesheet(timesheet));
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

exports.getTimesheets = getTimesheets;

async function getDrafts (conditions) {
  const queryParams = getConditions(conditions);
  const drafts = await queries.timesheetDraft.all(queryParams);
  return drafts.map(draft => transformDraft(draft));
}

function transformDraft (draft) {
  Object.assign(draft.dataValues, { project: draft.dataValues.task ? draft.dataValues.task.dataValues.project : null });
  if (draft.dataValues.task) delete draft.dataValues.task.dataValues.project;
  if (!draft.onDate) draft.dataValues.onDate = moment().format('YYYY-MM-DD');

  if (draft.dataValues.projectMaginActivity) {
    Object.assign(draft.dataValues, { project: draft.dataValues.projectMaginActivity.dataValues });
    delete draft.dataValues.projectMaginActivity;
  }

  draft.dataValues.isDraft = true;

  return draft.dataValues;
}

function getConditions (query) {
  const conditions = {
    deletedAt: null
  };

  if (query.onDate) {
    conditions.onDate = { $eq: new Date(query.onDate) };
  }

  if (query.sheetId) {
    conditions.id = { $eq: query.sheetId };
  }

  if (query.taskId) {
    conditions.taskId = { $eq: query.taskId };
  }

  if (query.taskStatusId) {
    conditions.taskStatusId = { $eq: query.taskStatusId };
  }

  return conditions;
}
