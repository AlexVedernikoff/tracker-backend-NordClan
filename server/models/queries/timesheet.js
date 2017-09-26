const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheet';

// проверка является ли исполнителем указанный пользователь
// проверка на статус таймшита
exports.canUserChangeTimesheet = function(userId, timesheetId) {
  
  return models.Timesheet
    .findOne({
      where: {
        id: timesheetId,
        statusId: models.TimesheetStatusesDictionary.NON_BLOCKED_IDS,
      },
      attributes: ['id', 'typeId', 'taskId', 'onDate', 'statusId', 'spentTime'],
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
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId'],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: false,
          attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false,
            }
          ]
        },
        {
          as: 'project',
          model: models.Project,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false,
        },
      ],
    })
    .then((model) => {
      if(!model) return createError(404, 'User can\'t change timesheet');
      if (model.dataValues.task && model.dataValues.task.dataValues.project) {
        model.dataValues.project = model.dataValues.task.dataValues.project;
        delete model.dataValues.task.dataValues.project;
      }
      return model;
    });

};