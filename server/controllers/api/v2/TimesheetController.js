const createError = require('http-errors');
const TimesheetService = require('../../../services/timesheet/index');
const TimesheetsChannel = require('../../../channels/Timesheets');

exports.create = async (req, res, next) => {
  const timesheetParams = { ...req.body, userId: req.user.id };

  TimesheetService
    .create(timesheetParams)
    .then((timesheet) => {
      TimesheetsChannel.sendAction('create', timesheet, res.io, req.user.id);
      res.json(timesheet);
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
    taskStatusId: req.body.statusId,
    taskId: req.body.taskId,
    onDate: req.onDate
  };

  TimesheetService
    .getTracksAll(startDate, endDate, params)
    .then(tracks => {
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
    .update(req.body)
    .then(timesheet => {
      TimesheetsChannel.sendAction('update', timesheet, res.io, req.user.id);
      res.json(timesheet);
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
      timesheets.forEach(timesheet => {
        TimesheetsChannel.sendAction('destroy', timesheet, res.io, req.user.id);
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

  const actions = {
    ['created timesheet']: (timesheet) => {
      TimesheetsChannel.sendAction('create', timesheet, res.io, req.user.id);
      res.json(timesheet);
    },
    ['updated draft']: (draft) => {
      TimesheetsChannel.sendAction('update', draft, res.io, req.user.id);
      res.json(draft);
    }
  };

  const draftId = req.params.sheetId || req.body.sheetId || req.query.sheetId;

  TimesheetService
    .updateDraft(req.body, draftId, req.user.id)
    .then(result => {
      actions[result.action](result.data);
    })
    .catch(e => {
      return next(createError(e));
    });
};
