const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');


exports.create = function(req, res, next) {
  if(!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.body.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if(!req.body.linkedTaskId.toString().match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be int'));
  
  req.params.taskId = req.params.taskId.trim();
  
  Promise.all([
    models.TaskTasks.findOrCreate({
      where: {
        taskId: req.params.taskId,
        linkedTaskId: req.body.linkedTaskId
      },
      attributes: ['id']
    }),
    models.TaskTasks.findOrCreate({
      where: {
        taskId: req.body.linkedTaskId,
        linkedTaskId: req.params.taskId
      },
      attributes: ['id']
    })
  ])
    .then(() => {
      return queries.taskTasks.findLinkedTasks(req.params.taskId)
        .then((result) => {
          res.json(result);
        });
    })
    .catch((err)=>next(err));
};


exports.delete = function(req, res, next) {
  if(!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.params.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if(!req.params.linkedTaskId.toString().match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));
  
  req.params.taskId = req.params.taskId.trim();
  
  Promise.all([
    models.TaskTasks
      .findOne({
        where: {
          taskId: req.params.taskId,
          linkedTaskId: req.params.linkedTaskId
        }
      })
      .then(model => {
        if(model) return model.destroy();
      })
    ,
    models.TaskTasks.destroy({
      where: {
        taskId: req.params.linkedTaskId,
        linkedTaskId: req.params.taskId
      }
    })
  ])
    .then(() => {
      return queries.taskTasks.findLinkedTasks(req.params.taskId);
    })
    .then((result) => {
      res.json(result);
    })
    .catch((err)=>next(err));
};
