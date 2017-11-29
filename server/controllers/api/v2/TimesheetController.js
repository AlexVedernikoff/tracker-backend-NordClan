const createError = require('http-errors');
const Sequelize = require('../../../orm/index');
const queries = require('../../../models/queries');
const models = require('../../../models');
const moment = require('moment');
const { timesheetsList } = require('../../../services/timesheet/index');
const TimesheetsChannelClass = require('../../../channels/Timesheets');
const TimesheetsChannel = new TimesheetsChannelClass();

exports.create = async (req, res, next) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(req.body);
  if (!isNeedCreateTimesheet) {
    return next(createError(400, `Some timesheet already exists on date ${req.body.onDate}`));
  }
  const timesheetParams = { ...req.body, userId: req.user.id };
  try {
    const timesheet = await createTimesheet(timesheetParams);
    timesheet.dataValues.isDraft = false;
    TimesheetsChannel.sendAction('create', timesheet, res.io, req.user.id);
    res.json(timesheet);
  } catch (e) {
    return next(createError(e));
  }
};

//TODO: лучше эти вычисления на клиент вынести
exports.getTracksAll = async (req, res, next) => {
  const dateRange = getDateRange(req.query.startDate, req.query.endDate);
  try {
    const tracksData = await Promise
      .all(dateRange.map(async (onDate) => {
        const tracks = await getTracks(req, onDate);
        const scales = getScales(tracks);
        return { tracks, scales, onDate };
      }));

    const formatTracksData = tracksData.reduce((acc, { tracks, scales, onDate }) => {
      acc[onDate] = { tracks, scales };
      return acc;
    });

    res.json(formatTracksData);
  } catch (e) {
    return next(createError(e));
  }
};

function getScales (tracks) {
  const timesheetTypes = models.TimesheetTypesDictionary.values;
  const scales = tracks
    .filter(track => timesheetTypes.some(type => type.id === track.typeId))
    .reduce((acc, track) => {
      acc[track.typeId] = acc[track.typeId] || 0;
      acc[track.typeId] += parseInt(track.spentTime);
      return acc;
    }, {});

  scales.all = Object
    .values(scales)
    .reduce((acc, value) => acc + value, 0);

  return scales;
}

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

exports.list = async function (req, res, next) {
  if (req.isSystemUser) {
    // В роуте можно использовать либо userId либо userPSId. Одно из них обязательно
    if (req.query.userId) {
      req.checkQuery('userId', 'userId must be int').isInt();
    } else if (req.query.userPSId) {
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    } else {
      req.checkQuery('userId', 'userId must be int').isInt();
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    }
  }

  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;
  const userId = req.isSystemUser ? req.query.userId : req.user.id;
  const userPSId = req.query.userPSId ? req.query.userPSId : null;

  timesheetsList()
    .call(dateBegin, dateEnd, userId, userPSId, req.isSystemUser)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.update = async (req, res, next) => {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  if (req.params.sheetId) {
    req.body.sheetId = req.params.sheetId;
  }

  req.query.userId = req.user.id;

  try {
    const updatedTimesheet = await updateTimesheet(req.body);
    const onDate = updatedTimesheet.onDate;

    if (req.query.return === 'trackList' && onDate) {
      const tracksParams = { ...req, body: {}, params: {} };
      const tracks = await getTracks(tracksParams, onDate);
      const updatedTracks = {
        [onDate]: {
          scales: getScales(tracks),
          tracks
        }
      };

      res.json(updatedTracks);
    }

    TimesheetsChannel.sendAction('update timesheet', updatedTimesheet, res.io, req.user.id);
    res.json(updatedTimesheet);
  } catch (e) {
    return next(createError(e));
  }
};

async function updateTimesheet (params) {
  const transaction = await Sequelize.transaction();
  const queryParams = {
    sheetId: params.sheetId
  };

  const timesheets = await getTimesheets(queryParams);

  if (timesheets.length === 0) {
    throw new Error('Timesheet not found');
  }

  const timesheet = timesheets[0];
  await models.Timesheet.update(params, { where: { id: timesheet.id } });

  try {
    if (params.spentTime && timesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const task = await queries.task.findOneActiveTask(timesheet.taskId, ['id', 'factExecutionTime'], transaction);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${params.spentTime} - ${timesheet.spentTime})`)},
        { where: { id: task.id }, transaction: transaction });
    }

    await transaction.commit();
    return await queries.timesheet.getTimesheet(timesheet.id);
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
}

//TODO refactoring
exports.delete = async (req, res, next) => {
  req.checkParams('timesheetId', 'timesheetId must be integer or comma-separated integers. Exp: 1,2,3').matches(/^\d+(,\d+)*$/);
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const timesheetIds = req.params.timesheetId.split(',');
  const transaction = await Sequelize.transaction();

  try {
    await Promise.all(timesheetIds.map(async (id) => {
      const timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, id);
      if (timesheetModel.taskId && timesheetModel.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
        const task = await queries.task.findOneActiveTask(timesheetModel.taskId, ['id', 'factExecutionTime'], transaction);
        await models.Task.update({
          factExecutionTime: models.sequelize.literal(`"fact_execution_time" - ${timesheetModel.spentTime}`)},
        { where: { id: task.id }, transaction });
      }

      await timesheetModel.destroy({transaction});
      TimesheetsChannel.sendAction('destroy', timesheetModel, res.io, req.user.id);
    }));

    transaction.commit();
    res.end();
  } catch (e) {
    await transaction.rollback();
    return next(createError(e));
  }
};

//TODO Вынести в отдельный сервис
async function createTimesheet (timesheetParams) {
  const transaction = await Sequelize.transaction();

  const isNeedUpdateTask = timesheetParams.taskId
    && timesheetParams.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION;

  if (isNeedUpdateTask) {
    const task = await queries.task.findOneActiveTask(timesheetParams.taskId,
      ['id', 'factExecutionTime'],
      transaction);

    await models.Task.update({
      factExecutionTime: models.sequelize.literal(`"fact_execution_time" + ${timesheetParams.spentTime}`)
    }, {
      where: { id: task.id },
      transaction
    });
  }

  const timesheet = await models.Timesheet.create(timesheetParams, {
    transaction
  });

  await transaction.commit();
  return await queries.timesheet.getTimesheet(timesheet.id);
}

//TODO refactoring
exports.updateDraft = async function (req, res, next) {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  const query = {
    id: req.params.sheetId || req.body.sheetId || req.query.sheetId,
    taskStatusId: req.body.statusId,
    taskId: req.body.taskId,
    onDate: req.body.onDate
  };

  const drafts = await getDrafts(query);
  const draft = drafts[0];

  if (req.body.spentTime) {
    const transaction = await Sequelize.transaction();

    await models.TimesheetDraft.destroy({ where: { id: draft.id }, transaction });

    delete draft.id;
    if (draft.taskId) {
      const task = await queries.task.findOneActiveTask(draft.taskId, ['id', 'factExecutionTime'], transaction);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${draft.spentTime})`) }, {
        where: {
          id: task.dataValues.id
        },
        transaction
      });
    }

    const needCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(draft);
    if (!needCreateTimesheet) {
      await transaction.rollback();
      return next(createError(400, `Some timesheet already exists on date ${draft.onDate}`));
    }

    const timesheet = await models.Timesheet.create(draft, { transaction });
    // const extensibleTimesheet = await queries.timesheet.getTimesheet(timesheet.id);
    const extensibleTimesheets = await getTimesheets(query);
    const extensibleTimesheet = extensibleTimesheets[0];

    console.log(extensibleTimesheet);

    await transaction.commit();

    TimesheetsChannel.sendAction('create', extensibleTimesheet, res.io, req.user.id);
    res.json(extensibleTimesheet);
  }

  await models.TimesheetDraft.update(req.body, { where: { id: draft.id }});
  // const extensibleDraft = await queries.timesheetDraft.findDraftSheet(req.user.id, draft.id);
  const extensibleDrafts = await getDrafts(query);
  const extensibleDraft = extensibleDrafts[0];
  // const extensibleDraft = await queries.timesheetDraft.findDraftSheet(req.user.id, draft.id);
  // extensibleDraft.dataValues.isDraft = true;

  TimesheetsChannel.sendAction('update timesheet', extensibleDraft, res.io, req.user.id);
  res.json(extensibleDraft);
};

//TODO what is it?
async function setAdditionalInfo (tmp, req) {
  tmp.userRoleId = null;
  tmp.isBillible = false;
  tmp.onDate = moment().format('YYYY-MM-DD');

  if (tmp.projectId) {
    const roles = await queries.projectUsers.getUserRolesByProject();

    if (roles) {
      tmp.isBillible = !!~roles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID);
      const index = roles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID);
      if (index > -1) roles.splice(index, 1);
      tmp.userRoleId = roles;
    }
  }

  if (!tmp.userId) {
    tmp.userId = req.user.id;
  }

  return tmp;
}
