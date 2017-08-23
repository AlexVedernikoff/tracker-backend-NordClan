const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheet';

// проверка является ли исполнителем указанный пользователь
// +  проверка на статус таймшита
exports.canUserChangeTimesheet = function(userId, timesheetId) {
  
  return models.Timesheet
    .findOne({
      required: true,
      where: {
        id: timesheetId,
        statusId: models.TimesheetStatusesDictionary.NON_BLOCKED_IDS,
      },
      attributes: ['id', 'typeId', 'onDate', 'statusId'],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: true,
          attributes: [],
          where: {
            statusId: {
              $notIn: models.TaskStatusesDictionary.NOT_AVAILABLE_STATUSES
            },
            performerId: userId,
          },
        }
      ],
    })
    .then((model) => {
      if(!model) throw createError(404, 'User can\'t change timesheet');
      return model;
    });
  
};

exports.getTimesheet = function(timesheetId) {
  
  return models.Timesheet
    .findOne({
      required: true,
      where: {
        id: timesheetId,
      },
      attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId'],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: true,
          attributes: ['id', 'name'],
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: true,
              attributes: ['id', 'name'],
              paranoid: false,
            }
          ]
        }
      ],
    })
    .then((model) => {
      if(!model) throw createError(404, 'User can\'t change timesheet');
      model.dataValues.project = model.dataValues.task.dataValues.project;
      delete model.dataValues.task.dataValues.project;
      return model;
    });

};