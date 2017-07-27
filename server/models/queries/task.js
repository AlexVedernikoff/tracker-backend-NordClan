const models = require('../');
const createError = require('http-errors');

exports.name = 'task';

exports.findOneActiveTask = function(projectId, attributes = ['id']) {
  return models.Task
    .findOne({where: {
      id: projectId,
      deletedAt: null,
    }, attributes: attributes})
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
        statusId: {
          $notIn: models.TaskStatusesDictionary.NOT_AVAILABLE_STATUSES
        }
      },
      include: [
        {
          as: 'performer',
          model: models.User,
          attributes: ['id', 'firstNameRu', 'lastNameRu'],
          through: {
            model: models.TaskUsers,
            attributes: [],
            paranoid: false

          },
          required: true,
          where: {
            id: userId,
          },
        },
      ]
    })
    .then((model) => {
      if(!model) throw createError(404, 'Task, or performer in task not found');
      return model;
    });

};