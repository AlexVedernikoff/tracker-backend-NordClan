const createError = require('http-errors');
const models = require('../../../models');
const { Task } = models;
const TasksChannel = require('../../../channels/Tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const TasksService = require('../../../services/tasks');
const emailSubprocess = require('../../../services/email/subprocess');
const TimesheetService = require('../../../services/timesheets');
const moment = require('moment');

const taskIsDone = tasks => tasks[0].statusId === models.TaskStatusesDictionary.DONE_STATUS;

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

  if (req.body.plannedExecutionTime > 99) return next(createError(400, 'Planned Execution Time must be lower than 99 hours'));

  try {
    if (req.body.hasOwnProperty('sprintId')) {
      const projectBySprint = await models.Sprint.findByPrimary(req.body.sprintId, {
        attributes: ['projectId']
      });

      if (!!req.body.sprintId !== false && (!projectBySprint || (projectBySprint && projectBySprint.projectId !== req.body.projectId))) {
        return next(createError(400, 'projectId wrong'));
      }
    }

    Task.beforeValidate((model) => {
      model.authorId = req.user.id;
    });

    if (Array.isArray(req.body.performerId) && req.body.performerId.length === 0) {
      req.body.performerId = null;
    }

    const task = await TasksService.create(req.body);
    if (task.performerId) {
      emailSubprocess({
        eventId: models.ProjectEventsDictionary.values[1].id,
        input: { taskId: task.id },
        user: { ...req.user.get() }
      });
    }
    emailSubprocess({
      eventId: models.ProjectEventsDictionary.values[0].id,
      input: { taskId: task.id },
      user: { ...req.user.get() }
    });

    if (req.user.dataValues.globalRole === models.User.EXTERNAL_USER_ROLE) {
      delete task.dataValues.plannedExecutionTime;
      delete task.dataValues.factExecutionTime;
    }

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
    let updatedTasks, activeTask, createdDraft, projectId, changedTaskData, updatedTask;
    const result = { updatedTasks, updatedTask, activeTask, createdDraft, projectId, changedTaskData } = await TasksService.update(req.body, taskId, req.user, req.isSystemUser);
    sendUpdates(res.io, req.user.id, updatedTasks, updatedTask, activeTask, createdDraft, projectId, changedTaskData);
    console.log(JSON.stringify(changedTaskData));
    if (changedTaskData.performerId && !taskIsDone(updatedTasks)) {
      emailSubprocess({
        eventId: models.ProjectEventsDictionary.values[1].id,
        input: { taskId },
        user: { ...req.user.get() }
      });
    }
    if (changedTaskData.statusId && taskIsDone(updatedTasks)) {
      emailSubprocess({
        eventId: models.ProjectEventsDictionary.values[3].id,
        input: { taskId },
        user: { ...req.user.get() }
      });
    }

    res.sendStatus(200);
  } catch (err) {
    next(createError(err));
  }
};

exports.updateAllByAttribute = async function (req, res, next) {
  if (isErrorReqUpdateAll(req)) return next(createError(400));

  try {
    await TasksService.updateAllByAttribute({sprintId: req.body.sprintId}, req.body.taskIds, req.user);
    res.sendStatus(200);
  } catch (err) {
    next(createError(err));
  }
};

function isErrorReqUpdateAll (req) {
  return !req.body.taskIds || !req.body.taskIds.length || !req.body.sprintId
    || req.body.taskIds.some(id => isNaN(id));
}

function sendUpdates (io, userId, updatedTasks, updatedTask, activeTask, createdDraft, projectId, changedTaskData) {

  if (changedTaskData.statusId || changedTaskData.performerId) {
    TimesheetsChannel.sendAction('setActiveTask', updatedTask, io, updatedTask.dataValues.performerId);
  }

  if (createdDraft) {
    TimesheetsChannel.sendAction('create', createdDraft, io, userId);
  }

  if (updatedTasks) {
    TimesheetsChannel.sendAction('setActiveTask', updatedTask, io, updatedTask.dataValues.performerId);
    TimesheetsChannel.sendTaskUpdate(updatedTask, io);
  }

  updatedTasks.forEach(task => {
    TasksChannel.sendAction('update', task.dataValues, io, projectId);
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

  if (req.query.performerId) {
    if (Array.isArray(req.query.performerId)) {
      if (req.query.performerId.some(performerId => !performerId.match(/^\d+$/))) return next(createError(400, 'performerId must be array of int'));
    } else if (!req.query.performerId.match(/^\d+$/)) {
      return next(createError(400, 'performerId must be int'));
    }
  }

  if (req.query.dateFrom) {
    if (!moment(req.query.dateFrom, 'DD.MM.YYYY').isValid()) {
      return next(createError(400, 'dateFrom must be date format "DD.MM.YYYY"'));
    }
  }

  if (req.query.dateTo) {
    if (!moment(req.query.dateTo, 'DD.MM.YYYY').isValid()) {
      return next(createError(400, 'dateTo must be date format "DD.MM.YYYY"'));
    }
  }

  if (req.query.dateFrom && req.query.dateTo) {
    if (moment(req.query.dateFrom, 'DD.MM.YYYY').unix() > moment(req.query.dateTo, 'DD.MM.YYYY').unix()) {
      return next(createError(400, 'dateTo must be later then dateFrom'));
    }
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
