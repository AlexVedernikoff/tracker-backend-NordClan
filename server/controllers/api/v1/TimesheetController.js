const createError = require('http-errors');
const TimesheetService = require('../../../services/timesheets');
const TasksService = require('../../../services/tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const TaskChannel = require('../../../channels/Tasks');
const models = require('../../../models');
const { getAverageNumberOfEmployees: _getAverageNumberOfEmployees } = require('../../../services/reports/utils');

exports.create = async (req, res, next) => {
  const userId = req.body.userId || req.user.id; // Todo: validate user rights
  const { taskId } = req.body;
  const timesheetParams = {
    ...req.body,
    userId,
  };

  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }

  TimesheetService.create(timesheetParams)
    .then(createdTimesheet => {
      TimesheetsChannel.sendAction('create', createdTimesheet, res.io, userId);
      res.json(createdTimesheet);
      if (taskId) {
        TasksService.read(taskId, req.user).then(task => {
          if (task) {
            TaskChannel.sendAction('update', task, res.io, task.projectId);
          }
        });
      }
    })
    .catch(e => {
      return next(createError(e));
    });
};

exports.getTracksAll = async (req, res, next) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const activeTasks = await TasksService.getActiveTasks(req.user.id);
  const activeTask = activeTasks.length !== 0 ? activeTasks[0] : await TasksService.getLastActiveTask(req.user.id);

  TimesheetService.getTracksAll(startDate, endDate, req.user.id)
    .then(tracks => {
      TimesheetsChannel.sendAction('setActiveTask', activeTask, res.io, req.user.id);
      res.json(tracks);
    })
    .catch(e => next(createError(e)));
};

exports.getAverageNumberOfEmployees = async function (req, res, next) {
  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const { dateBegin, dateEnd } = req.query;

  const averageNumberOfEmployees = await _getAverageNumberOfEmployees(dateBegin, dateEnd, {
    precision: 1,
  });

  res.json({ total: averageNumberOfEmployees });
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
  const task = taskId
    ? await models.Task.findByPrimary(taskId, {
      attributes: ['id', 'projectId'],
    })
    : null;
  const isAllTimeSheets = taskId ? req.user.isAdminOfProject(task.projectId) : false;
  const userId = req.isSystemUser ? req.query.userId : isAllTimeSheets ? false : req.user.id;

  TimesheetService.list(dateBegin, dateEnd, taskId, userId, userPSId, req.isSystemUser)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.listProject = async function (req, res, next) {
  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;
  const projectId = req.params.projectId;

  TimesheetService.listProject(dateBegin, dateEnd, projectId, req.isSystemUser)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.listTask = async function (req, res, next) {
  const taskId = req.params.taskId;

  TimesheetService.listTask(taskId)
    .then(timesheets => res.json(timesheets))
    .catch(error => next(createError(error)));
};

exports.listAllProjects = async function (req, res, next) {
  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const dateBegin = req.query.dateBegin;
  const dateEnd = req.query.dateEnd;

  TimesheetService.listProject(dateBegin, dateEnd, undefined, req.isSystemUser)
    .then(timesheets => {
      res.json(timesheets);
    })
    .catch(error => next(createError(error)));
};

exports.listAllByUser = async function (req, res, next) {
  if (req.user.globalRole !== 'ADMIN') {
    return next(createError(400, 'The user must have the ADMIN role'));
  }
  req.checkQuery('userId', 'userId must be int').isInt();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const userId = req.query.userId;

  TimesheetService.listByUser(userId)
    .then(timesheets => {
      res.json(timesheets);
    })
    .catch(error => next(createError(error)));
};

const updateTimesheet = async (req, res) => {
  const { taskId } = req.body; //eslint-disable-line
  await TimesheetService.update(req)
    .then(sheet =>
      Promise.all([
        taskId && TasksService.read(taskId, req.user),
        sheet,
        taskId && TasksService.read(sheet.taskId, req.user),
      ])
    )
    .then(([task, sheet, taskSheet]) => {
      TimesheetsChannel.sendAction('update', !task ? sheet : { ...sheet, task }, res.io, sheet.userId);
      if (task) {
        TaskChannel.sendAction('update', taskSheet, res.io, taskSheet.projectId);
      }
    });
};

exports.update = async (req, res, next) => {
  if (req.body.spentTime && req.body.spentTime < 0) {
    return next(createError(400, 'spentTime wrong'));
  }
  if (Array.isArray(req.body.sheetId)) {
    const requests = req.body.sheetId.map(id => {
      const singleReq = {
        ...req,
        body: {
          ...req.body,
          sheetId: id,
        },
      };
      return updateTimesheet(singleReq, res);
    });
    Promise.all(requests)
      .then(() => res.end())
      .catch(e => next(createError(e)));
  } else {
    updateTimesheet(req, res)
      .then(() => res.end())
      .catch(e => next(createError(e)));
  }
};

exports.delete = async (req, res, next) => {
  req
    .checkParams('timesheetId', 'timesheetId must be integer or comma-separated integers. Exp: 1,2,3')
    .matches(/^\d+(,\d+)*$/);
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const timesheetIds = req.params.timesheetId.split(',');

  TimesheetService.destroy(timesheetIds, req.user.id)
    .then(timesheets => {
      timesheets.forEach(deletedTimesheet => {
        TimesheetsChannel.sendAction('destroy', deletedTimesheet, res.io, req.user.id);
        if (deletedTimesheet.taskId) {
          TasksService.read(deletedTimesheet.taskId, req.user).then(task => {
            if (task) {
              TaskChannel.sendAction('update', task, res.io, task.projectId);
            }
          });
        }
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
  const { sheetId, taskId, ...body } = req.body; //eslint-disable-line

  TimesheetService.updateDraft(body, draftId, req.user.id)
    .then(sheet => Promise.all([taskId && TasksService.read(taskId, req.user), sheet]))
    .then(([task, { updatedDraft, createdTimesheet }]) => {
      if (updatedDraft) {
        TimesheetsChannel.sendAction('update', !task ? updatedDraft : { ...updatedDraft, task }, res.io, req.user.id);
      } else if (createdTimesheet) {
        TimesheetsChannel.sendAction(
          'create',
          !task ? createdTimesheet : { ...createdTimesheet, task },
          res.io,
          req.user.id
        );
      }

      res.end();
    })
    .catch(e => next(createError(e)));
};

exports.submit = async function (req, res, next) {
  const userId = req.body.userId || req.user.id;
  req.checkBody('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkBody('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  return TimesheetService.submit(
    userId,
    req.body.dateBegin,
    req.body.dateEnd,
    req.body.projectId,
    req.body.justRejected
  )
    .then(result => {
      result.forEach(sheet => TimesheetsChannel.sendAction('update', sheet, res.io, userId));
      res.json(result);
    })
    .catch(error => next(createError(400, error)));
};

exports.approve = async function (req, res, next) {
  req.checkBody('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkBody('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkBody('userId', 'userId must be int').isInt();
  req.checkBody('approvedByUserId', 'approvedByUserId must be int').isInt();

  const validationResult = await req.getValidationResult();

  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  return TimesheetService.approve(req.body.userId, req.body.dateBegin, req.body.dateEnd, req.body.projectId, req.body.approvedByUserId)
    .then(result => {
      result.forEach(sheet => TimesheetsChannel.sendAction('update', sheet, res.io, req.body.userId));
      res.json(result);
    })
    .catch(error => next(createError(400, error)));
};

exports.reject = async function (req, res, next) {
  req.checkBody('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkBody('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkBody('userId', 'userId must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  return TimesheetService.reject(req.body.userId, req.body.dateBegin, req.body.dateEnd, req.body.projectId)
    .then(result => {
      result.forEach(sheet => TimesheetsChannel.sendAction('update', sheet, res.io, req.body.userId));
      res.json(result);
    })
    .catch(error => next(createError(400, error)));
};
