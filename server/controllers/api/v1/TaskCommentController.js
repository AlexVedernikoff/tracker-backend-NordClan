const { includeProjectWithUsers } = require('../../../models/queries/task');
const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');
const emailSubprocess = require('../../../services/email/subprocess');
const { getMentionDiff } = require('./../../../services/comment');
const CommentsChannel = require('../../../channels/Comments');
const moment = require('moment');

exports.create = async function (req, res, next){
  try {
    req.checkParams('taskId', 'taskId must be int').isInt();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }

    const task = await models.Task
      .findByPrimary(req.params.taskId, {
        attributes: ['id', 'projectId'],
      });
    if (!task) return next(createError(404, 'Task model not found'));
    if (!req.user.canCreateCommentProject(task.projectId)) {
      return next(createError(403, 'Access denied'));
    }

    req.body.authorId = req.user.id;
    req.body.taskId = req.params.taskId;

    const comment = await models.Comment.create(req.body);
    const getOne = await queries.comment.getOne(comment.id);
    let parentCommentAuthorId;

    if (req.body.parentId) {
      const parentComment = await queries.comment.getOne(req.body.parentId);
      parentCommentAuthorId = parentComment.author.dataValues.id;
    }

    emailSubprocess({
      eventId: models.ProjectEventsDictionary.values[2].id,
      input: { taskId: task.id, commentId: comment.id, parentCommentAuthorId },
      user: { ...req.user.get() },
    });
    res.json(getOne);
    const currentTask = await queries.task.getTaskWithUsers(getOne.dataValues.taskId);
    if (getOne) {
      CommentsChannel.updateTaskComments(
        res.io,
        req.user.dataValues.id,
        getOne.dataValues.taskId,
        currentTask.project.projectUsers
      );
    }
  } catch (e) {
    return next(createError(e));
  }
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
          attributes: ['id', 'projectId'],
          include: includeProjectWithUsers,
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId', 'createdAt', 'text'],
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

      const isTooLateForEdit = moment().diff(comment.createdAt, 'minutes') >= 10;
      if (isTooLateForEdit) {
        return next(createError(400, 'Too late for changes'));
      }
      const { text, attachmentIds } = req.body;
      const newMentions = getMentionDiff(text, comment.text);
      if (newMentions.length) {
        emailSubprocess({
          eventId: models.ProjectEventsDictionary.values[4].id,
          input: { taskId: task.id, commentId: comment.id },
          user: newMentions,
        });
      }

      return comment
        .updateAttributes({ text, attachmentIds })
        .then((model)=>{
          res.json(model);
          CommentsChannel.updateTaskComments(
            res.io,
            req.user.dataValues.id,
            task.dataValues.id,
            task.project.projectUsers
          );
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
          attributes: ['id', 'projectId'],
          include: includeProjectWithUsers,
        }), models.Comment
        .findByPrimary(req.params.commentId, {
          attributes: ['id', 'deletedAt', 'authorId'],
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
      return comment.destroy()
        .then(() => res.end())
        .then(() => {
          if (task) {
            CommentsChannel.updateTaskComments(
              res.io,
              req.user.dataValues.id,
              task.dataValues.id,
              task.project.projectUsers
            );
          }
        });
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
