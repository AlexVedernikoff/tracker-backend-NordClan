const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');
const userSubscriptionEvents = require('../../../services/userSubscriptionEvents');

exports.create = async function (req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const task = await models.Task
    .findByPrimary(req.params.taskId, {
      attributes: ['id', 'projectId']
    });
  if (!task) return next(createError(404, 'Task model not found'));
  if (!req.user.canCreateCommentProject(task.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  req.body.authorId = req.user.id;
  req.body.taskId = req.params.taskId;

  const comment = await models.Comment.create(req.body);
  const getOne = await queries.comment.getOne(comment.id);
  await userSubscriptionEvents(models.ProjectEventsDictionary.values[2].id, { taskId: task.id, commentId: comment.id });
  res.json(getOne);
};

exports.update = function (req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();
  req.checkParams('commentId', 'commentId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      return Promise.all([models.Task
        .findByPrimary(req.params.taskId, {
          attributes: ['id', 'projectId']
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId']
        })]);
    })
    .then(([task, comment])=>{
      if (!task) {
        return next(createError(404, 'Task model not found'));
      }
      if (!comment) {
        return next(createError(404, 'Comment model not found'));
      }
      if (!req.user.canUpdateCommentProject(task.projectId)) {
        return next(createError(403, 'Access denied'));
      }
      if (comment.authorId !== req.user.id && !req.user.isGlobalAdmin) {
        return next(createError(403, 'User is not an author of comment'));
      }

      const { text } = req.body;

      return comment
        .updateAttributes({ text })
        .then((model)=>{
          res.json(model);
        });
    })
    .catch((err) => next(err));
};


exports.delete = function (req, res, next){
  req.checkParams('taskId', 'taskId must be int').isInt();
  req.checkParams('commentId', 'commentId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      return Promise.all([models.Task
        .findByPrimary(req.params.taskId, {
          attributes: ['id', 'projectId']
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId']
        })]);
    })
    .then(([task, comment])=>{
      if (!task) {
        return next(createError(404, 'Task model not found'));
      }
      if (!comment) {
        return next(createError(404, 'Comment model not found'));
      }
      if (!req.user.canUpdateCommentProject(task.projectId)) {
        return next(createError(403, 'Access denied'));
      }
      if (comment.authorId !== req.user.id && !req.user.isGlobalAdmin){
        return next(createError(403, 'User is not an author of comment'));
      }

      return comment.destroy();
    })
    .then(()=> res.end())
    .catch((err) => next(err));
};

exports.list = async function (req, res, next){
  const taskId = req.params.taskId;
  if (taskId && !taskId.match(/^\d+$/)) return next(createError(400, 'taskId must be int'));

  const task = await models.Task.findByPrimary(taskId, { attributes: ['id', 'projectId']});
  if (!req.user.canReadProject(task.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  queries.comment.getCommentsByTask(taskId)
    .then((_models) => {
      res.json(_models);
    })
    .catch((err) => next(err));

};
