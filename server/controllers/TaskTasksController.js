const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');


exports.create = function(req, res, next) {
  if(!req.params.taskId) return next(createError(400, 'taskId must be not empty'));
  if(!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.body.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if(!req.body.linkedTaskId.match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));
  
  req.params.taskId = req.params.taskId.trim();
  req.body.linkedTaskId = req.body.linkedTaskId.trim();
  
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
          res.end(JSON.stringify(result));
        });
    })
    .catch((err)=>next(err));
};


exports.delete = function(req, res, next) {
  if(!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.params.linkedTaskId.match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));
  
  req.params.taskId = req.params.taskId.trim();
  req.params.linkedTaskId = req.params.linkedTaskId.trim();
  
  models.TaskTasks.destroy({
    where: {
      taskId: req.params.taskId,
      linkedTaskId: req.params.linkedTaskId
    }
  })
    .then(() => {
      return queries.taskTasks.findLinkedTasks(req.params.taskId);
    })
    .then((result) => {
      res.end(JSON.stringify(result));
    })
    .catch((err)=>next(err));
};
