'use strict'

const createError = require('http-errors');
const _ = require('underscore');
const moment = require('moment');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');

exports.getTimesheets = async function (req, res, next) {
  try {
    let date = new Date(req.query.onDate);
    let timesheets = await models.Timesheet.findAll({
      where: {
        userId: req.params.userId,
        onDate: {
          $eq: date
        }
      },
      attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible'],
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
      Object.assign(ds.dataValues, { project: ds.dataValues.task.dataValues.project });
      delete ds.dataValues.task.dataValues.project;
      delete ds.dataValues.taskStatusId;
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
  Object.assign(result, { timesheets: { visible: visible, invisible: invisible } });

  visible = [];
  invisible = [];

  draftsheets.map(ds => {
    if (ds.isVisible) {
      visible.push(ds);
    } else {
      invisible.push(ds);
    }
  });
  Object.assign(result, { draftsheets: { visible: visible, invisible: invisible } });

  return result;
}


exports.getTracksOnOtherDay = async function (req, res, next) {
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
  Object.assign(result, { timesheets: { visible: visible, invisible: invisible } });
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



exports.create = function (req, res, next) {
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
    .catch((err) => next(err));
};

exports.update = function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  const currentUserId = req.user.id;
  const result = {};

  // Нужны транзакции
  queries.timesheet
    .canUserChangeTimesheet(currentUserId, req.params.timesheetId)
    .then((model) => {
      if (!model) return next(createError(404, 'Timesheet not found'));

      return model
        .updateAttributes(req.body)
        .then((model) => {
          _.keys(model.dataValues).forEach((key) => {
            if (req.body[key])
              result[key] = model.dataValues[key];
          });
          res.json(result);
        });
    })
    .catch((err) => next(err));
};


exports.delete = function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  const currentUserId = req.user.id;

  queries.timesheet
    .canUserChangeTimesheet(currentUserId, req.params.timesheetId)
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