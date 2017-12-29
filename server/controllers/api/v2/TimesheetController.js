const createError = require('http-errors');
const TimesheetService = require('../../../services/timesheets');
const TasksService = require('../../../services/tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const TasksChannel = require('../../../channels/Tasks');

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
    .then(({ createdTimesheet, updatedTask }) => {
      TimesheetsChannel.sendAction('create', createdTimesheet, res.io, req.user.id);

      if (updatedTask) {
        TasksChannel.sendAction('update', updatedTask, res.io, updatedTask.projectId);
      }

      res.end();
    })
    .catch(e => {
      return next(createError(e));
    });
};

exports.getTracksAll = async (req, res, next) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const params = {
    id: req.params.sheetId || req.body.sheetId || req.query.sheetId,
    userId: req.user.id,
    taskStatusId: req.body.statusId,
    taskId: req.body.taskId,
    onDate: req.onDate
  };

  const activeTasks = await TasksService.getActiveTasks(req.user.id);
  const activeTask = activeTasks.length !== 0
    ? activeTasks[0]
    : await TasksService.getLastActiveTask(req.user.id);

  TimesheetService
    .getTracksAll(startDate, endDate, params)
    .then(tracks => {
      TimesheetsChannel.sendAction('setActiveTask', activeTask, res.io, req.user.id);
      res.json(tracks);
    })
    .catch(e => {
      return next(createError(e));
    });
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

  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;
  const userId = req.isSystemUser ? req.query.userId : req.user.id;
  const userPSId = req.query.userPSId ? req.query.userPSId : null;

  TimesheetService
    .list(dateBegin, dateEnd, userId, userPSId, req.isSystemUser)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.update = async (req, res, next) => {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  TimesheetService
    .update(req)
    .then(({ updatedTimesheet, updatedTask }) => {
      TimesheetsChannel.sendAction('update', updatedTimesheet, res.io, req.user.id);

      if (updatedTask) {
        TasksChannel.sendAction('update', updatedTask, res.io, updatedTask.projectId);
      }

      res.end();
    })
    .catch(e => {
      return next(createError(e));
    });
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
      timesheets.forEach(({ deletedTimesheet, updatedTask }) => {
        TimesheetsChannel.sendAction('destroy', deletedTimesheet, res.io, req.user.id);

        if (updatedTask) {
          TasksChannel.sendAction('update', updatedTask, res.io, updatedTask.projectId);
        }
      });
      res.end();
    })
    .catch(e => {
      return next(createError(e));
    });
};

exports.updateDraft = async function (req, res, next) {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  const draftId = req.params.sheetId || req.body.sheetId || req.query.sheetId;

  TimesheetService
    .updateDraft(req.body, draftId, req.user.id)
    .then(({ updatedDraft, createdTimesheet, updatedTask }) => {
      if (updatedDraft) {
        TimesheetsChannel.sendAction('update', updatedDraft, res.io, req.user.id);
      }

      if (createdTimesheet) {
        TimesheetsChannel.sendAction('create', createdTimesheet, res.io, req.user.id);
      }

      if (updatedTask) {
        TasksChannel.sendAction('update', updatedTask, res.io, updatedTask.projectId);
      }

      res.end();
    })
    .catch(e => {
      return next(createError(e));
    });
};
