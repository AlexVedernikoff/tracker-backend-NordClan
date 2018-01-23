const createError = require('http-errors');
const models = require('../../../models');
const { Task } = models;
const TasksChannel = require('../../../channels/Tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const TasksService = require('../../../services/tasks');
const userSubscriptionEvents = require('../../../services/userSubscriptionEvents');
const TimesheetService = require('../../../services/timesheets');

exports.create = async function (req, res, next) {
  req.checkBody('projectId', 'projectId must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) return next(createError(400, validationResult));

  if (!req.user.canReadProject(req.body.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  if (req.body.tags) {
    req.body.tags.split(',').map(el => el.trim()).forEach(el => {
      if (el.length < 2) return next(createError(400, 'tag must be more then 2 chars'));
    });
  }

  Task.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  try {
    const task = await TasksService.create(req.body);
    TasksChannel.sendAction('create', task, res.io, task.projectId);
    if (task.performerId) await userSubscriptionEvents(models.ProjectEventsDictionary.values[1].id, { taskId: task.id });
    await userSubscriptionEvents(models.ProjectEventsDictionary.values[0].id, { taskId: task.id });
    res.json(task);
  } catch (err) {
    next(createError(err));
  }
};

exports.read = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) {
    return next(createError(400, 'id must be int'));
  }

  TasksService
    .read(req.params.id, req.user)
    .then(task => res.json(task))
    .catch((err) => next(createError(err)));
};

exports.update = async function (req, res, next) {
  req.checkParams('id', 'id must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) return next(createError(400, validationResult));

  const taskId = req.params.id;

  try {
    const result = { updatedTasks, activeTask, createdDraft, projectId, changedTaskData } = await TasksService.update(req.body, taskId, req.user, req.isSystemUser);
    sendUpdates(res.io, req.user.id, updatedTasks, activeTask, createdDraft, projectId);
    if (changedTaskData.performerId) await userSubscriptionEvents(models.ProjectEventsDictionary.values[1].id, { taskId });
    if (changedTaskData.statusId && updatedTasks[0].statusId === models.TaskStatusesDictionary.DONE_STATUS) {
      await userSubscriptionEvents(models.ProjectEventsDictionary.values[3].id, { taskId });
    }
    res.sendStatus(200);
  } catch (err) {
    next(createError(err));
  }
};

function sendUpdates (io, userId, updatedTasks, activeTask, createdDraft, projectId) {
  if (createdDraft) {
    TimesheetsChannel.sendAction('create', createdDraft, io, userId);
  }

  if (activeTask) {
    TimesheetsChannel.sendAction('setActiveTask', activeTask, io, userId);
  }

  updatedTasks.forEach(updatedTask => {
    TasksChannel.sendAction('update', updatedTask.dataValues, io, projectId);
  });
}

exports.delete = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  TasksService
    .destroy(req.params.id, res.user.id)
    .then(() => {
      res.end();
    })
    .catch((e) => {
      next(createError(e));
    });
};

exports.list = function (req, res, next) {
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) {
    return next(createError(400, 'currentPage must be int'));
  }

  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) {
    return next(createError(400, 'pageSize must be int'));
  }

  if (req.query.performerId && !req.query.performerId.toString().match(/^\d+$/)) {
    return next(createError(400, 'performerId must be int'));
  }

  TasksService
    .list(req)
    .then(tasks => res.json(tasks))
    .catch((e) => next(createError(e)));
};

exports.getSpentTime = async function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  TasksService.read(req.params.id, req.user)
    .then(() => {
      return TimesheetService
        .getTaskSpent(req.params.id)
        .then((model) => {
          res.json(model);
        });
    })
    .catch((err) => next(createError(err)));
};
