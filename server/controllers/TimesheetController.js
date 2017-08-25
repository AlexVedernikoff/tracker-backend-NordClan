'use strict'

const createError = require('http-errors');
const _ = require('underscore');
const moment = require('moment');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');
const Sequelize = require('../orm/index');

exports.getTimesheets = async function (req, res, next) {
  try {
    let where = { userId: req.user.id };
    if (req.query.onDate) {
      let date = new Date(req.query.onDate);
      Object.assign(where, { onDate: { $eq: date } });
    }
    if (req.params && req.params.sheetId) {
      Object.assign(where, { id: { $eq: req.params.sheetId } });
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
  Object.assign(result,  { visible: visible, invisible: invisible });
  return result;
}


exports.getTracks = async function (req, res, next) {
  let now = new Date();
  let result;
  let today = moment(now).format('YYYY-MM-DD');
  if (moment(req.query.onDate).isSame(today)) {
    result = await this.getTracksOnCurrentDay(req, res, next);
  } else {
    result = await this.getTracksOnOtherDay(req, res, next);
  }
  res.json(result);
}

exports.setTrackTimesheetTime = async function (req, res, next) {
  if (req.body.isDraft == "true") {
    try {
      delete req.body.isDraft;
      let tmp = {};
      let draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
      if (!draftsheet) return next(createError(404, 'Draftsheet not found'));
      Object.assign(tmp, draftsheet[0]);

      let t = await Sequelize.transaction();
      let deleted = await models.TimesheetDraft.destroy({ where: { id: tmp.id }, transaction: t });
      delete tmp.id;
      let createTs = await models.Timesheet.create(tmp, { transaction: t });
      let task = await queries.task.findOneActiveTask(createTs.dataValues.taskId, ['id', 'factExecutionTime'], t);
      let time = await parseInt(req.body.spentTime, 10) - tmp.spentTime;
      await models.Task.update({ factExecutionTime: task.dataValues.factExecutionTime + time }, { where: { id: task.dataValues.id }, transaction: t });
      await t.commit();

      let result = await queries.timesheet.getTimesheet(createTs.dataValues.id);
      res.json(result);
    } catch (e) {
      return next(createError(e));
    }

  } else {
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
      res.json(result);
    } catch (e) {
      return next(createError(e));
    }

  }
}


///////////////////////

exports.create = async function (req, res, next) {
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  try {
    await queries.task.isPerformerOfTask(req.user.id, req.params.taskId);
    Object.assign(req.body, { userId: req.user.id, taskId: req.params.taskId });
    let newsheet = await models.Timesheet.create(req.body);
    let result = await queries.timesheet.getTimesheet(newsheet.id);
    res.json(result);
  } catch (e) {
    next(err);
  }

  /*
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  const currentUserId = req.user.id;

  queries.task
    .isPerformerOfTask(currentUserId, req.params.taskId)
    .then(() => {
      req.body.userId = currentUserId;
      req.body.taskId = req.params.taskId;
      return models.Timesheet.create(req.body);
    })
    .then((model) => {
      return queries.timesheet.getTimesheet(model.id);
    })
    .then((model) => {
      res.json(model.dataValues);
    })
    .catch((err) => next(err));*/
};

exports.update = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    let timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    if (!timesheetModel) return next(createError(404, 'Timesheet not found'));
    let result = await timesheetModel.updateAttributes(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
};


exports.delete = function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));

  queries.timesheet
    .canUserChangeTimesheet(req.user.id, req.params.timesheetId)
    .then((model) => {
      if (!model) return next(createError(404, 'Timesheet not found'));
      return model.destroy();
    })
    .then(() => {
      res.end();
    })
    .catch((err) => next(err));
};

exports.list = function (req, res, next) {
  if (req.query.dateBegin && !req.query.dateBegin.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if (req.query.dateEnd && !req.query.dateEnd.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if (req.params.taskId && !req.params.taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));
  if (req.query.userId && !req.query.userId.match(/^\d+$/)) return next(createError(400, 'userId must be int'));


  const where = {
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
      where.onDate.$and.$gte = req.query.dateBegin;
    }

    if (req.query.dateEnd) {
      where.onDate.$and.$lte = req.query.dateEnd;
    }
  }


  models.Timesheet.findAll({
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
  })
    .then((models) => {
      // Преобразую результат
      models.forEach(model => {
        model.dataValues.project = model.dataValues.task.dataValues.project;
        delete model.dataValues.task.dataValues.project;
      });
      res.json(models);
    })
    .catch((err) => next(err));

};