const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');
const moment = require('moment');

async function getTracks (req, onDate) {
  const today = moment().format('YYYY-MM-DD');
  const queryParams = {
    id: req.params.sheetId || req.body.sheetId || req.query.sheetId,
    taskStatusId: req.body.statusId,
    taskId: req.body.taskId,
    onDate: onDate || req.onDate
  };

  const timesheets = await getTimesheets(queryParams);
  const drafts = moment(onDate).isSame(today) ? await getDrafts(queryParams) : [];
  return [ ...timesheets, ...drafts ];
}

function getConditions (query) {
  const conditions = {};

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

async function getTimesheets (conditions) {
  const queryParams = getConditions(conditions);
  const timesheets = await queries.timesheet.all(queryParams);
  return timesheets.map(timesheet => transformTimesheet(timesheet));
}

//TODO Дичь какая-то, надо бы тоже порефакторить
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

exports.getDrafts = getDrafts;

function getDateRange (startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  const difference = end.diff(start, 'days');

  if (!start.isValid() || !end.isValid() || difference <= 0) {
    throw new Error('Invalid dates specified. Please check format and or make sure that the dates are different');
  }

  const dateFormat = 'YYYY-MM-DD';
  return Array.from({ length: difference + 1 }, (_, v) => v).map(i => {
    return moment(endDate).subtract(i, 'd').format(dateFormat);
  });
}

exports.getDateRange = getDateRange;

//TODO remove req from args
exports.isNeedCreateDraft = async (body, task, now, isSystemUser) => {
  const performerId = task.performerId || body.performerId;

  if (!performerId) {
    return false;
  }

  if (!body.statusId) {
    return false;
  }

  const timesheetQueryParams = {
    taskStatusId: body.statusId,
    taskId: task.id,
    onDate: now
  };

  if (!isSystemUser) {
    timesheetQueryParams.userId = task.performerId;
  }

  const timesheets = await getTimesheets(timesheetQueryParams);
  const drafts = await getDrafts(timesheetQueryParams);

  return ((drafts.length === 0 && timesheets.length === 0)
    && ~models.TaskStatusesDictionary.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS.indexOf(parseInt(body.statusId)));
};
