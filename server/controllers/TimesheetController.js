const createError = require('http-errors');
const _ = require('underscore');
const moment = require('moment');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');
const Sequelize = require('../orm/index');
const dateArray = require('moment-array-dates');

/**
 * Функция поиска таймшитов
 */
exports.getTimesheets = async function (req, res, next) {
  try {
    let where = {
      userId: req.query.userId,
      deletedAt: null
    };
    if (req.query.onDate) {
      let date = new Date(req.query.onDate);
      Object.assign(where, { onDate: { $eq: date } });
    }
    if (req.params && req.params.sheetId) {
      Object.assign(where, { id: { $eq: req.params.sheetId } });
    }
    if (req.query.taskId) {
      Object.assign(where, { taskId: { $eq: req.query.taskId } });
    }
    if (req.query.taskStatusId) {
      Object.assign(where, { taskStatusId: { $eq: req.query.taskStatusId } });
    }

    let timesheets = await models.Timesheet.findAll({
      where: where,
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId'],
      order: [
        ['createdAt', 'ASC']
      ],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: true,
          attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: true,
              attributes: ['id', 'name'],
              paranoid: false,
            },
            {
              as: 'taskStatus',
              model: models.TaskStatusesDictionary,
              required: true,
              attributes: ['id', 'name'],
              paranoid: false,
            }
          ]
        },
        {
          as: 'taskStatus',
          model: models.TaskStatusesDictionary,
          required: true,
          attributes: ['id', 'name'],
          paranoid: false
        }
      ]
    });
    let result = [];
    timesheets.map(ds => {
      Object.assign(ds.dataValues, { project: ds.dataValues.task.dataValues.project, isDraft: false });
      ds.dataValues.onDate =  ds.onDate;
      delete ds.dataValues.task.dataValues.project;
      result.push(ds.dataValues);
    });
    return result;
  } catch (e) {
    return next(createError(e));
  }
};

/**
 * Функция составления треков на текущий день
 */
exports.getTracksOnCurrentDay = async function (req, res, next) {
  let result;
  let timesheets =  this.getTimesheets(req, res, next);
  let draftsheets = TimesheetDraftController.getDrafts(req, res, next);
  timesheets = await timesheets;
  draftsheets = await draftsheets;
  result = { tracks: [...timesheets, ...draftsheets] };
  return result;
};

/**
 *  Функция составления треков на не текущий день
 */
exports.getTracksOnOtherDay = async function (req, res, next) {
  let result;
  let timesheets = await this.getTimesheets(req, res, next);
  result = { tracks: timesheets };
  return result;
};

/**
 *  Функция составления треков для трекера
 */
exports.getTracks = async function (req, res, next) {
  let now = new Date();
  let result;
  let today = moment(now).format('YYYY-MM-DD');
  req.query.userId = req.user.id;
  if (moment(req.query.onDate).isSame(today)) {
    result = await this.getTracksOnCurrentDay(req, res, next);
  } else {
    result = await this.getTracksOnOtherDay(req, res, next);
  }
  return result;
};

/**
 *  Функция загрузки треков на неделю 
 */
exports.getTracksAll = async function (req, res, next) {
  const result = {};
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const dateArr = dateArray.range(startDate, endDate, 'YYYY-MM-DD', true);
  await Promise.all(dateArr.map(async (onDate) => {
    req.query.onDate = onDate;
    let tracks =  await this.getTracks(req, res, next);
    // пройти по трекам
    const scales = {};
    tracks.tracks.map(track => {
      models.TimesheetTypesDictionary.values.map(value => {
        if (track.typeId == value.id) {
          if (scales.hasOwnProperty(value.id)) {
            scales[value.id] = +scales[value.id] + +track.spentTime;
          } else {
            scales[value.id] = 0;
            scales[value.id] = +scales[value.id] + +track.spentTime;
          }
        }
      });
    });
    let sum = 0;
    Object.keys(scales).map(key => {
      sum += +scales[key];
    });
    Object.assign(scales, {all: sum});
    let tr = tracks.tracks;
    result[onDate] = { tracks: tr, scales};
    return;
  }));

  res.json(result);
};

/**
 * Функция поиска драфтшита его удаления и создание нового таймшита
 */
exports.setDraftTimesheetTime = async function (req, res, next) {
  try {
    delete req.body.isDraft;
    let tmp = {};
    const draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
    if (!draftsheet || draftsheet.length === 0) return;
    Object.assign(tmp, draftsheet[0]);

    const t = await Sequelize.transaction();
    await models.TimesheetDraft.destroy({ where: { id: tmp.id }, transaction: t });
    delete tmp.id;

    const task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
    await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${tmp.spentTime})`) }, {
      where: {
        id: task.dataValues.id
      },
      transaction: t
    });

    Object.assign(tmp, { spentTime: req.body.spentTime });
    const createTs = await models.Timesheet.create(tmp, { transaction: t });
    await t.commit();

    return await queries.timesheet.getTimesheet(createTs.dataValues.id);
  } catch (e) {
    return next(createError(e));
  }
};

/**
 * Функция поиска и обновления таймшита
 */
exports.setTimesheetTime = async function (req, res, next) {
  let t;

  try {
    t = await Sequelize.transaction();
  } catch (e) {
    next(createError(e));
  }

  try {
    let tmp = {};
    delete req.body.isDraft;
    let timesheet = await this.getTimesheets(req, res, next);
    if (!timesheet) return next(createError(404, 'Timesheet not found'));
    Object.assign(tmp, timesheet[0]);

    await models.Timesheet.update(req.body, { where: { id: tmp.id } });
    let task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
    await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${tmp.spentTime})`)}, { where: { id: task.id }, transaction: t });
    await t.commit();

    return await queries.timesheet.getTimesheet(tmp.id);
  } catch (e) {
    await t.rollback();
    next(createError(e));
  }
};


/**
 * Функция для проставления времени для таймшитов в трекере
 */

exports.setTrackTimesheetTime = async function (req, res, next) {
  let result;
  req.query.userId = req.user.id;
  if (Boolean(req.body.isDraft) === true) {
    if (req.body.spentTime) {
      result = await this.setDraftTimesheetTime(req, res, next);
    }
    if (req.body.comment || req.body.isVisible) {
      let draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
      let tmp = {};
      Object.assign(tmp, draftsheet[0]);
      await models.TimesheetDraft.update({comment: req.body.comment, isVisible: req.body.isVisible}, { where: { id: tmp.id }});
      result = await queries.timesheetDraft.findDraftSheet(req.user.id, tmp.id);
    }
    res.json(result);
  } else {
    if (req.body.spentTime) {
      result = await this.setTimesheetTime(req, res, next);
    }
    if (req.body.comment || req.body.isVisible) {
      let timesheet = await this.getTimesheets(req, res, next);
      let tmp = {};
      Object.assign(tmp, timesheet[0]);
      await models.Timesheet.update({comment: req.body.comment, isVisible: req.body.isVisible}, { where: { id: tmp.id }});
      result = await queries.timesheet.getTimesheet(tmp.id);
    }
    res.json(result);
  }
};

/**
 * Функция для создания или обновления таймшитов в UI таблице таймшитов
 */
exports.createOrUpdateTimesheet = async function (req, res, next) {
  req.query.onDate = req.body.onDate;
  req.query.taskId = req.params.taskId;
  req.query.userId = req.user.id;
  req.query.taskStatusId = req.body.taskStatusId;
  let result = await this.setDraftTimesheetTime(req, res, next);
  if (!result) {
    result = await this.setTimesheetTime(req, res, next);
  }
  res.json(result);
};

/**
 * @deprecated
 */
exports.create = async function (req, res, next) {
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  try {
    await queries.task.isCanCreateUpdateTimesheet(req.user.id, req.params.taskId);
    Object.assign(req.body, { userId: req.user.id, taskId: req.params.taskId });
    let newsheet = await models.Timesheet.create(req.body);
    let result = await queries.timesheet.getTimesheet(newsheet.id);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};

exports.update = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    let timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    if (!timesheetModel) return next(createError(404, 'Timesheet not found'));
    let result = await timesheetModel.updateAttributes(req.body);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};


exports.delete = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    let timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    if (!timesheetModel) return next(createError(404, 'Timesheet not found'));
    await timesheetModel.destroy();
    res.end();
  } catch (e) {
    return next(e);
  }
};

exports.list = async function (req, res, next) {
  if (req.query.dateBegin && !req.query.dateBegin.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if (req.query.dateEnd && !req.query.dateEnd.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  //if (req.params.taskId && !req.params.taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));
  if (req.query.userId && !req.query.userId.match(/^\d+$/)) return next(createError(400, 'userId must be int'));


  let where = {
    deletedAt: null
  };

  if (req.params.taskId) {
    where.taskId = req.params.taskId;
  }

  if (req.query.userId) {
    where.userId = req.query.userId;
  }

  if (req.query.dateBegin || req.query.dateEnd) {

    where.onDate = {
      $and: {}
    };

    if (req.query.dateBegin) {
      where.onDate.$and.$gte = new Date(req.query.dateBegin);
    }

    if (req.query.dateEnd) {
      where.onDate.$and.$lte = new Date(req.query.dateEnd);
    }
  }

  try {
    let timesheets = await models.Timesheet.findAll({
      where: where,
      attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId'],
      order: [
        ['createdAt', 'ASC']
      ],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: true,
          attributes: ['id', 'name'],
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: true,
              attributes: ['id', 'name'],
              paranoid: false,
            }
          ]
        }
      ],
    });

    timesheets.forEach(model => {
      model.project = model.task.project;
      delete model.task.project;
    });
    res.json(timesheets);
  } catch (e) {
    return next(e);
  }
};