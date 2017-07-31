const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  if(!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  const currentUserId = req.user.id;
  
  queries.task
    .isPerformerOfTask(currentUserId, req.params.taskId)
    .then(()=>{
      req.body.userId = currentUserId;
      req.body.taskId = req.params.taskId;
      return models.Timesheet.create(req.body);
    })
    .then((model) => {
      return queries.timesheet.getTimesheet(model.id);
    })
    .then((model)=>{
      res.end(JSON.stringify(model.dataValues));
    })
    .catch((err) => next(err));
};

exports.update = function(req, res, next){
  if(!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  const currentUserId = req.user.id;
  const result = {};
  
  //models.Timesheet.context = { user: req.user };
  
  queries.timesheet
    .canUserChangeTimesheet(currentUserId, req.params.timesheetId)
    .then((model) => {
      if(!model) return next(createError(404, 'Timesheet not found'));
      
      return model
        .updateAttributes(req.body)
        .then((model)=>{
          _.keys(model.dataValues).forEach((key) => {
            if(req.body[key])
              result[key] = model.dataValues[key];
          });
          res.end(JSON.stringify(result));
        });
    })
    .catch((err) => next(err));
};


exports.delete = function(req, res, next){
  if(!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  const currentUserId = req.user.id;
  
  queries.timesheet
    .canUserChangeTimesheet(currentUserId, req.params.timesheetId)
    .then((model) => {
      if(!model) return next(createError(404, 'Timesheet not found'));
      return model.destroy();
    })
    .then(()=>{
      res.end();
    })
    .catch((err) => next(err));
};

exports.list = function(req, res, next){
  if(req.query.dateBegin && !req.query.dateBegin.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if(req.query.dateEnd && !req.query.dateEnd.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if(req.params.taskId && !req.params.taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));
  if(req.query.userId && !req.query.userId.match(/^\d+$/)) return next(createError(400, 'userId must be int'));
  
  
  const where = {
    deletedAt: null
  };
  
  if(req.params.taskId) {
    where.taskId = req.params.taskId;
  }
  
  if(req.query.userId) {
    where.userId = req.query.userId;
  }
  
  if(req.query.dateBegin || req.query.dateEnd) {
  
    where.onDate = {
      $and: {}
    };
  
    if(req.query.dateBegin) {
      where.onDate.$and.$gte = req.query.dateBegin;
    }
  
    if(req.query.dateEnd) {
      where.onDate.$and.$lte = req.query.dateEnd;
    }
  }
  

  models.Timesheet.findAll({
    where: where,
    attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment'],
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
      res.end(JSON.stringify(models));
    })
    .catch((err) => next(err));

};