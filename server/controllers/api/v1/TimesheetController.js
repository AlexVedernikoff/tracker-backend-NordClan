const createError = require('http-errors');
const TimesheetService = require('../../../services/timesheets');
const TasksService = require('../../../services/tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const models = require('../../../models');

exports.create = async (req, res, next) => {
  const timesheetParams = {
    ...req.body,
    userId: req.user.id,
    taskStatusId: req.body.taskStatusId || 2
  };

  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  TimesheetService
    .create(timesheetParams)
    .then(createdTimesheet => {
      TimesheetsChannel.sendAction('create', createdTimesheet, res.io, req.user.id);
      res.json(createdTimesheet);
    })
    .catch(e => {
      return next(createError(e));
    });
};

exports.getTracksAll = async (req, res, next) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const activeTasks = await TasksService.getActiveTasks(req.user.id);
  const activeTask = activeTasks.length !== 0
    ? activeTasks[0]
    : await TasksService.getLastActiveTask(req.user.id);

  TimesheetService
    .getTracksAll(startDate, endDate, req.user.id)
    .then(tracks => {
      TimesheetsChannel.sendAction('setActiveTask', activeTask, res.io, req.user.id);
      res.json(tracks);
    })
    .catch(e => next(createError(e)));
};

exports.list = async function (req, res, next) {
  if (req.isSystemUser) {
    // В роуте можно использовать либо userId либо userPSId. Одно из них обязательно
    if (req.query.userId) {
      req.checkQuery('userId', 'userId must be int').isInt();
    } else if (req.query.userPSId) {
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    } else {
      req.checkQuery('userId', 'userId must be int').isInt();
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    }
  }

  if (!req.query.taskId) {
    req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
    req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();
  } else {
    req.checkQuery('taskId', 'taskId is invalid or not defined. You should define int taskId or time period').isInt();
  }


  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;
  const taskId = req.query.taskId;
  const userPSId = req.query.userPSId ? req.query.userPSId : null;
  const task = taskId ? await models.Task.findByPrimary(taskId, {
    attributes: ['id', 'projectId']
  }) : null;
  const isAllTimeSheets = taskId ? req.user.isAdminOfProject(task.projectId) : false;
  const userId
    = req.isSystemUser ? req.query.userId
      : isAllTimeSheets ? false : req.user.id;

  TimesheetService
    .list(dateBegin, dateEnd, taskId, userId, userPSId, req.isSystemUser)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.update = async (req, res, next) => {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  TimesheetService
    .update(req)
    .then(updatedTimesheets => {
      updatedTimesheets.map(sheet => {
        TimesheetsChannel.sendAction('update', sheet, res.io, req.isSystemUser ? sheet.userId : req.user.id);
      });
      res.end();
    })
    .catch(e => next(createError(e)));
};

exports.delete = async (req, res, next) => {
  req.checkParams('timesheetId', 'timesheetId must be integer or comma-separated integers. Exp: 1,2,3').matches(/^\d+(,\d+)*$/);
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const timesheetIds = req.params.timesheetId.split(',');

  TimesheetService
    .destroy(timesheetIds, req.user.id)
    .then(timesheets => {
      timesheets.forEach(deletedTimesheet => {
        TimesheetsChannel.sendAction('destroy', deletedTimesheet, res.io, req.user.id);
      });
      res.end();
    })
    .catch(e => next(createError(e)));
};

exports.updateDraft = async function (req, res, next) {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  const draftId = req.params.sheetId || req.body.sheetId || req.query.sheetId;

  TimesheetService
    .updateDraft(req.body, draftId, req.user.id)
    .then(({updatedDraft, createdTimesheet}) => {
      if (updatedDraft) {
        TimesheetsChannel.sendAction('update', updatedDraft, res.io, req.user.id);
      }

      if (createdTimesheet) {
        TimesheetsChannel.sendAction('create', createdTimesheet, res.io, req.user.id);
      }

      res.end();
    })
    .catch(e => next(createError(e)));
};
