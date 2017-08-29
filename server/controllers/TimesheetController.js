'use strict'

const createError = require('http-errors');
const _ = require('underscore');
const moment = require('moment');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');
const Sequelize = require('../orm/index');


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
      attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId'],
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
      delete ds.dataValues.task.dataValues.project;
      result.push(ds.dataValues);
    });
    return result;
  } catch (e) {
    return next(createError(e));
  }
}

/**
 * Функция составления треков на текущий день
 */
exports.getTracksOnCurrentDay = async function (req, res, next) {
  let result = {};
  let visible = [];
  let invisible = [];
  let timesheets = await this.getTimesheets(req, res, next);
  let draftsheets = await TimesheetDraftController.getDrafts(req, res, next);

  timesheets.map(ts => {
    if (ts.isVisible) {
      visible.push(ts);
    } else {
      invisible.push(ts);
    }
  });

  draftsheets.map(ds => {
    if (ds.isVisible) {
      visible.push(ds);
    } else {
      invisible.push(ds);
    }
  });
  Object.assign(result, { visible: visible, invisible: invisible });
  return result;
}

/**
 *  Функция составления треков на не текущий день
 */
exports.getTracksOnOtherDay = async function (req, res, next) {
  let result = {};
  let visible = [];
  let invisible = [];
  let timesheets = await this.getTimesheets(req, res, next);

  timesheets.map(ts => {
    if (ts.isVisible) {
      visible.push(ts);
    } else {
      invisible.push(ts);
    }
  });
  Object.assign(result, { visible: visible, invisible: invisible });
  return result;
}

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
  res.json({ data: result, onDate: new Date(req.query.onDate) });
}

/**
 *  Функция загрузки треков на неделю 
 */
exports.getTracksByPeriod = async function(req, res, next) {
  // считать таймшиты на каждый день недели
}

/**
 * Функция поиска драфтшита его удаления и создание нового таймшита
 */
exports.setDraftTimesheetTime = async function (req, res, next) {
  try {
    delete req.body.isDraft;
    let tmp = {};
    let draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
    if (!draftsheet || draftsheet.length == 0) return;
    Object.assign(tmp, draftsheet[0]);

    let t = await Sequelize.transaction();
    let deleted = await models.TimesheetDraft.destroy({ where: { id: tmp.id }, transaction: t });
    delete tmp.id;
    Object.assign(tmp, { spentTime: req.body.spentTime });
    let createTs = await models.Timesheet.create(tmp, { transaction: t });
    let task = await queries.task.findOneActiveTask(createTs.dataValues.taskId, ['id', 'factExecutionTime'], t);
    let time = await parseInt(req.body.spentTime, 10) - tmp.spentTime;
    await models.Task.update({ factExecutionTime: task.dataValues.factExecutionTime + time }, { where: { id: task.dataValues.id }, transaction: t });
    await t.commit();

    let result = await queries.timesheet.getTimesheet(createTs.dataValues.id);
    return result;
  } catch (e) {
    return next(createError(e));
  }
}

/**
 * Функция поиска и обновления таймшита
 */
exports.setTimesheetTime = async function (req, res, next) {
  try {
    let tmp = {};
    delete req.body.isDraft;
    let timesheet = await this.getTimesheets(req, res, next);
    if (!timesheet) return next(createError(404, 'Timesheet not found'));
    Object.assign(tmp, timesheet[0]);

    let t = await Sequelize.transaction();
    await models.Timesheet.update(req.body, { where: { id: tmp.id } });
    let task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
    let time = await parseInt(req.body.spentTime, 10) - tmp.spentTime;
    await models.Task.update({ factExecutionTime: task.dataValues.factExecutionTime + time }, { where: { id: task.dataValues.id }, transaction: t });
    await t.commit();

    let result = await queries.timesheet.getTimesheet(tmp.id);
    return result;
  } catch (e) {
    return next(createError(e));
  }
}


/**
 * Функция для проставления времени для таймшитов в трекере
 */

exports.setTrackTimesheetTime = async function (req, res, next) {
  let result;
  req.query.userId = req.user.id;
  if (req.body.isDraft == "true") {
    result = await this.setDraftTimesheetTime(req, res, next);
    res.json(result);
  } else {
    result = await this.setTimesheetTime(req, res, next);
    res.json(result);
  }
}


///////////////////////
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
}

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
  if (req.params.taskId && !req.params.taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));
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
      model.dataValues.project = model.dataValues.task.dataValues.project;
      delete model.dataValues.task.dataValues.project;
    });
    res.json(timesheets);
  } catch (e) {
    return next(e);
  }
};