const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      return models.Task
        .findByPrimary(req.params.taskId, {
          attributes: ['id', 'statusId']
        });
    })
    .then((model)=>{
      if(!model) return next(createError(404, 'Task model not found'));

      req.body.authorId = req.user.id;
      req.body.taskId = req.params.taskId;

      return models.Comment.create(req.body);
    })
    .then((model) => queries.comment.getOne(model.id))
    .then((model)=>{
      res.json(model);
    })
    .catch((err) => next(err));
};

exports.update = function(req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();
  req.checkParams('commentId', 'commentId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      return Promise.all([models.Task
        .findByPrimary(req.params.taskId, {
          attributes: ['id', 'statusId']
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId']
        })]);
    })
    .then(([task, comment])=>{
      if(!task) return next(createError(404, 'Task model not found'));
      if(!comment) return next(createError(404, 'Comment model not found'));
      if(comment.dataValues.authorId !== req.user.id) next(createError(403, 'User is not an author of comment'));
      if(comment.dataValues.deletedAt) next(createError(404, 'Nothing to edit'));
      const { text } = req.body;
      return comment
        .updateAttributes({ text })
        .then((model)=>{
          res.json(model.dataValues);
        });
    })
    .catch((err) => next(err));
};


exports.delete = function(req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();
  req.checkParams('commentId', 'commentId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      return Promise.all([models.Task
        .findByPrimary(req.params.taskId, {
          attributes: ['id', 'statusId']
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId']
        })]);
    })
    .then(([task, comment])=>{
      if(!task) return next(createError(404, 'Task model not found'));
      if(!comment) return next(createError(404, 'Comment model not found'));
      if(comment.dataValues.authorId !== req.user.id) next(createError(403, 'User is not an author of comment'));
      if(comment.dataValues.deletedAt) next(createError(404, 'Nothing to delete'));

      return comment.destroy();
    })
    .then(()=> res.end())
    .catch((err) => next(err));
};

exports.list = function(req, res, next){
  const taskId = req.params.taskId;

  if(taskId && !taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));

  queries.comment.getCommentsByTask(taskId)
    .then((models) => {
      res.json(models);
    })
    .catch((err) => next(err));

};