const queries = require('../../../models/queries');
const moment = require('moment');
const exactMath = require('exact-math');
const { ProjectUsers, Project } = require('../../../models');

exports.getTracksAll = async (startDate, endDate, params) => {
  const dateRange = getDateRange(startDate, endDate);

  const tracksData = await Promise
    .all(dateRange.map(async (onDate) => {
      const tracks = await getTracks({...params, onDate});
      const scales = getScales(tracks);
      return { tracks, scales, onDate };
    }));

  const formatTracksData = tracksData.reduce((acc, { tracks, scales, onDate }) => {
    acc[onDate] = { tracks, scales };
    return acc;
  }, {});

  formatTracksData.availableProjects = await getAvailableProjects(params.userId);

  return formatTracksData;
};

async function getTracks (params) {
  const today = moment().format('YYYY-MM-DD');
  const timesheets = await getTimesheets(params);
  const drafts = moment(params.onDate).isSame(today) ? await getDrafts(params) : [];
  return [ ...timesheets, ...drafts ];
}

function getScales (tracks) {
  return tracks
    .reduce((acc, track) => {
      acc[track.typeId] = acc[track.typeId] || 0;
      acc[track.typeId] = exactMath.add(acc[track.typeId], track.spentTime || 0);
      acc.all = exactMath.add(acc.all, track.spentTime || 0);
      return acc;
    }, { all: 0 });
}

exports.getScales = getScales;

function getConditions (query) {
  const conditions = {
    userId: {
      $eq: query.userId
    }
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

async function getTimesheets (conditions) {
  const queryParams = getConditions(conditions);
  const timesheets = await queries.timesheet.all(queryParams);
  return timesheets.map(timesheet => transformTimesheet(timesheet));
}

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.task && timesheet.dataValues.task.dataValues.project) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.task.dataValues.project });
    delete timesheet.dataValues.task.dataValues.project;
  }
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues });
    delete timesheet.dataValues.projectMaginActivity;
  }

  timesheet.dataValues.onDate = timesheet.onDate;
  timesheet.dataValues.isDraft = false;
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

async function getAvailableProjects (userId) {
  return await ProjectUsers.findAll({
    where: { userId },
    attributes: ['id'],
    include: [
      {
        as: 'project',
        model: Project,
        attributes: ['id', 'name', 'prefix']
      }
    ]
  });
}

exports.getDateRange = getDateRange;
