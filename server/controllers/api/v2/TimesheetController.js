const createError = require('http-errors');
const Sequelize = require('../../../orm/index');
const queries = require('../../../models/queries');
const models = require('../../../models');
const moment = require('moment');
const { timesheetsList } = require('../../../services/timesheet/index');

exports.create = async (req, res, next) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(req.body);
  if (!isNeedCreateTimesheet) {
    return next(createError(400, `Some timesheet already exists on date ${req.body.onDate}`));
  }
  const timesheetParams = { ...req.body, userId: req.user.id };
  try {
    const timesheet = await createTimesheet(timesheetParams);
    res.json(timesheet);
  } catch (e) {
    return next(createError(e));
  }
};

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
  const today = moment();
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

//TODO refactoring
async function getTimesheets (conditions) {
  console.log(conditions);
  const queryParams = getConditions(conditions);
  console.log(queryParams);
  const timesheets = await queries.timesheet.all(queryParams);
  return timesheets.map(timesheet => {
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
  });
}

exports.getTimesheets = getTimesheets;

//TODO refactoring
async function getDrafts (conditions) {
  const queryParams = getConditions(conditions);
  const drafts = await queries.timesheetDraft.all(queryParams);
  return drafts.map(ds => {
    Object.assign(ds.dataValues, { project: ds.dataValues.task ? ds.dataValues.task.dataValues.project : null });
    if (ds.dataValues.task) delete ds.dataValues.task.dataValues.project;
    if (!ds.onDate) ds.dataValues.onDate = moment().format('YYYY-MM-DD');

    if (ds.dataValues.projectMaginActivity) {
      Object.assign(ds.dataValues, { project: ds.dataValues.projectMaginActivity.dataValues });
      delete ds.dataValues.projectMaginActivity;
    }

    ds.dataValues.isDraft = true;

    return ds.dataValues;
  });
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
    const updatedTimesheet = await setTimesheetTime(req);
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

      return res.json(updatedTracks);
    }

    res.json(updatedTimesheet);
  } catch (e) {
    return next(createError(e));
  }
};

async function setTimesheetTime (req) {
  delete req.body.isDraft;
  const transaction = await Sequelize.transaction();
  const queryParams = {
    sheetId: req.body.sheetId
  };

  const timesheets = await getTimesheets(queryParams);

  if (timesheets.length === 0) {
    throw new Error('Timesheet not found');
  }

  const timesheet = timesheets[0];
  await models.Timesheet.update(req.body, { where: { id: timesheet.id } });

  try {
    if (req.body.spentTime && timesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const task = await queries.task.findOneActiveTask(timesheet.taskId, ['id', 'factExecutionTime'], transaction);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${timesheet.spentTime})`)},
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
  try {
    if (req.body.spentTime && req.body.spentTime < 0) return next(createError(400, 'spentTime wrong'));
    if (req.params.sheetId) {
      req.body.sheetId = req.params.sheetId;
    }
    req.query.userId = req.user.id;

    let result = {};

    if (req.body.spentTime) { // Из драфта в тш
      result = await this.setDraftTimesheetTime(req, res, next);
    } else if (req.body.comment || 'isVisible' in req.body) { // Обновление драфта

      const newData = {};
      if (req.body.comment) newData.comment = req.body.comment;
      if ('isVisible' in req.body) newData.isVisible = req.body.isVisible;

      const timesheetQueryParams = {
        id: req.params.sheetId || req.body.sheetId || req.query.sheetId,
        taskStatusId: req.body.statusId,
        taskId: req.body.taskId,
        onDate: req.body.onDate
      };

      const draft = getDrafts(timesheetQueryParams)[0];
      await models.TimesheetDraft.update(newData, { where: { id: draft.id }});

      result = await queries.timesheetDraft.findDraftSheet(req.user.id, draft.id);
    }

    if (req.query.return === 'trackList' && result.onDate) {
      const tracks = await getTracks({
        ...req,
        body: {},
        params: {},
        query: {
          onDate: result.onDate
        }
      }, res, next);
      return res.json({
        [result.onDate]: {
          scales: getScales(tracks),
          tracks
        }
      });
    }

    res.json(result);

  } catch (e) {
    return next(createError(e));
  }
};
