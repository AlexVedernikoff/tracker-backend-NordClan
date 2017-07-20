const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');


exports.create = function(req, res, next) {
  if(!req.body.taskId) return next(createError(400, 'taskId must be not empty'));
  if(!req.body.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.body.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if(!req.body.linkedTaskId.match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));
  
  models.TaskTasks.findOrCreate({
    where: {
      taskId: req.body.taskId,
      linkedTaskId: req.body.linkedTaskId
    },
    attributes: ['id']
  })
    .spread(() => {
      return queries.taskTasks.findLinkedTasks(req.body.taskId);
    })
    .then((result) => {
      res.end(JSON.stringify(result));
    })
    .catch((err)=>next(err));
};


exports.delete = function(req, res, next) {
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.body.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if(!req.body.linkedTaskId.match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));
  
  models.TaskTasks.destroy({
    where: {
      taskId: req.params.id,
      linkedTaskId: req.body.linkedTaskId
    }
  })
    .then(() => {
      return queries.taskTasks.findLinkedTasks(req.params.id);
    })
    .then((result) => {
      res.end(JSON.stringify(result));
    })
    .catch((err)=>next(err));
};
