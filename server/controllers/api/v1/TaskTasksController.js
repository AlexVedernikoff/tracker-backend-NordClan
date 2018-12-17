const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async function (req, res, next) {
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if (!req.body.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if (!req.body.linkedTaskId.toString().match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be int'));

  let t;
  try {
    t = await models.sequelize.transaction();
    req.params.taskId = req.params.taskId.trim();
    const task = await models.Task.findByPrimary(req.params.taskId, { attributes: ['id', 'projectId']});

    if (!req.user.canReadProject(task.projectId)) {
      await t.rollback();
      return next(createError(403, 'Access denied'));
    }

    if (req.user.isDevOpsProject(task.projectId)) {
      await t.rollback();
      return next(createError(403, 'Access denied'));
    }

    await Promise.all([
      models.TaskTasks.findOrCreate({
        where: {
          taskId: req.params.taskId,
          linkedTaskId: req.body.linkedTaskId
        },
        attributes: ['id'],
        transaction: t,
        historyAuthorId: req.user.id
      }),
      models.TaskTasks.findOrCreate({
        where: {
          taskId: req.body.linkedTaskId,
          linkedTaskId: req.params.taskId
        },
        attributes: ['id'],
        transaction: t,
        historyAuthorId: req.user.id
      })
    ]);

    const taskTasks = await queries.taskTasks.findLinkedTasks(req.params.taskId, ['id', 'name', 'statusId'], t);
    res.json(taskTasks);
    t.commit();


  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};


exports.delete = async function (req, res, next) {
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if (!req.params.linkedTaskId) return next(createError(400, 'linkedTaskId must be not empty'));
  if (!req.params.linkedTaskId.toString().match(/^[0-9]+$/)) return next(createError(400, 'linkedTaskId must be not empty'));

  let t;
  try {
    t = await models.sequelize.transaction();
    req.params.taskId = req.params.taskId.trim();
    const task = await models.Task.findByPrimary(req.params.taskId, { attributes: ['id', 'projectId']});

    if (!req.user.canReadProject(task.projectId)) {
      await t.rollback();
      return next(createError(403, 'Access denied'));
    }

    if (req.user.isDevOpsProject(task.projectId)) {
      await t.rollback();
      return next(createError(403, 'Access denied'));
    }

    await Promise.all([
      models.TaskTasks
        .findOne({
          where: {
            taskId: req.params.taskId,
            linkedTaskId: req.params.linkedTaskId
          },
          transaction: t,
          lock: 'UPDATE'
        })
        .then(model => {
          if (model) return model.destroy({ transaction: t, historyAuthorId: req.user.id });
        }),
      models.TaskTasks.destroy({
        where: {
          taskId: req.params.linkedTaskId,
          linkedTaskId: req.params.taskId
        },
        transaction: t,
        historyAuthorId: req.user.id
      })
    ]);

    const taskTasks = await queries.taskTasks.findLinkedTasks(req.params.taskId, ['id', 'name', 'statusId'], t);
    res.json(taskTasks);
    t.commit();
  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};
