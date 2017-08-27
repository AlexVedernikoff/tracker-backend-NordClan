const models = require('../');
const createError = require('http-errors');

exports.name = 'task';

exports.findOneActiveTask = function(taskId, attributes = ['id', 'factExecutionTime'], t = null) {
  return models.Task
    .findOne({where: {
      id: taskId,
      deletedAt: null,
    }, attributes: attributes, transaction: t, lock: t ? 'UPDATE' : null})
    .then((model) => {
      if(!model) throw createError(404, 'Task not found');
      return model;
    });

};

// проверка является ли исполнителем указанный пользователь
exports.isPerformerOfTask = function(userId, taskId) {
  return models.Task
    .findOne({
      attributes: ['id'],
      where: {
        id: taskId,
        deletedAt: null,
        performerId: userId,
        statusId: {
          $notIn: models.TaskStatusesDictionary.NOT_AVAILABLE_STATUSES
        }
      },
    })
    .then((model) => {
      if(!model) throw createError(404, 'User can create/update time sheet');
      return model;
    });

};


// проверка можно ли создать/обновить таймшит на задачу
exports.isCanCreateUpdateTimesheet = function(userId, taskId) {
  return models.Task
    .findOne({
      attributes: ['id'],
      where: {
        id: taskId,
        deletedAt: null,
        performerId: userId,
        statusId: models.TaskStatusesDictionary.CAN_UPDATE_TIMESHEETS_STATUSES
      },
    })
    .then((model) => {
      if(!model) throw createError(404, 'User can\'t create/update time sheet');
      return model;
    });

};