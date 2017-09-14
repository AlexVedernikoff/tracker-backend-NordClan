const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('./TimesheetDraftController');
const TimesheetController = require('./TimesheetController');
const moment = require('moment');

exports.create = function (req, res, next) {
  if (!req.params.taskId) return next(createError(400, 'taskId need'));
  if (!Number.isInteger(+req.params.taskId)) return next(createError(400, 'taskId must be int'));
  if (+req.params.taskId <= 0) return next(createError(400, 'taskId must be > 0'));

  const now = moment().format('YYYY-MM-DD');
  let taskModel;
  let userModel;

  // Удаление исполнителя
  if (+req.body.userId === 0) {

    return models.sequelize.transaction(function (t) {
      return queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId', 'performerId'], t)
        .then((model) => {
          const newAttribures = {};
          newAttribures.performerId = null;
          if (+req.body.statusId > 0) newAttribures.statusId = +req.body.statusId;

          return model.updateAttributes(newAttribures, { transaction: t })
            .then(() => {
              res.json({ statusId: req.body.statusId ? +req.body.statusId : model.statusId, performer: null });
            });
        });
    })
      .catch((err) => {
        next(createError(err));
      });
  }

  if (!req.body.userId) return next(createError(400, 'userId need'));
  if (!Number.isInteger(+req.body.userId)) return next(createError(400, 'userId must be int'));
  if (+req.body.userId <= 0) return next(createError(400, 'userId must be > 0'));


  return models.sequelize.transaction().then(function (t) {
    return Promise.all([
      queries.user.findOneActiveUser(req.body.userId, models.User.defaultSelect, t)
        .then((model) => { userModel = model; }),
      queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId', 'performerId'], t)
        .then((model) => { taskModel = model; })
    ])
      .then(() => {
        if (+taskModel.statusId === models.TaskStatusesDictionary.CLOSED_STATUS) return next(createError(400, 'Task is closed'));

        const newAttribures = {};
        if (+req.body.userId > 0) newAttribures.performerId = +req.body.userId;
        if (+req.body.statusId > 0) newAttribures.statusId = +req.body.statusId;

        return taskModel.updateAttributes(newAttribures, { transaction: t })
          .then(() => {
            req.query.userId = req.body.userId;
            req.query.taskId = req.params.taskId;
            req.query.onDate = now;
            if (req.body.statusId) req.query.taskStatusId = req.body.statusId;
            let timesheet;
            let draftsheet;
            return Promise.all([
              TimesheetDraftController.getDrafts(req, res, next)
                .then((result) => { draftsheet = result; }),
              TimesheetController.getTimesheets(req, res, next)
                .then((result) => { timesheet = result; })
            ])
              .then(() => {
                if (draftsheet.length !== 0 || timesheet.length !== 0) {
                  t.commit();
                  res.json({ statusId: req.body.statusId ? +req.body.statusId : taskModel.statusId, performer: userModel });
                } else {
                  if (req.body.statusId && ~models.TaskStatusesDictionary.CAN_CREATE_DRAFTSHEET_STATUSES.indexOf(parseInt(req.body.statusId)) ||
                    ~models.TaskStatusesDictionary.CAN_CREATE_DRAFTSHEET_STATUSES.indexOf(parseInt(taskModel.statusId))) {
                    queries.task.findTaskWithUser(req.params.taskId, t)
                      .then((task) => {
                        queries.projectUsers.getUserRolesByProject(task.projectId, task.performerId, t)
                          .then((projectUserRoles) => {
                            let isBillible = true;
                            if (~projectUserRoles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID)) isBillible = false;
                            const timesheet = {
                              sprintId: task.dataValues.sprintId,
                              taskId: task.dataValues.id,
                              userId: task.dataValues.performerId,
                              onDate: now,
                              typeId: 1,
                              spentTime: 0,
                              comment: '',
                              isBillible: isBillible,
                              userRoleId: projectUserRoles.join(','),
                              taskStatusId: task.dataValues.statusId,
                              statusId: 1,
                              isVisible: true
                            };

                            const reqForDraft = Object.assign({}, req);
                            reqForDraft.body = Object.assign({}, reqForDraft.body, timesheet);
                            return TimesheetDraftController.createDraft(reqForDraft, res, next, t, true)
                              .then(() => {
                                t.commit();
                                res.json({ statusId: req.body.statusId ? +req.body.statusId : taskModel.statusId, performer: userModel });
                              });
                          });
                      });
                  } else {
                    t.commit();
                    res.json({ statusId: req.body.statusId ? +req.body.statusId : taskModel.statusId, performer: userModel });
                  }
                }
              });
          });
      })
      .catch((err) => {
        t.rollback();
        next(err);
      });
  })
    .catch((err) => {
      next(err);
    });

};
