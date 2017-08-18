const models = require('../');
const createError = require('http-errors');

exports.name = 'task';

exports.findOneActiveTask = function(projectId, attributes = ['id'], t = null) {
  return models.Task
    .findOne({where: {
      id: projectId,
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