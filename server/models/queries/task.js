const models = require('../');
const createError = require('http-errors');

exports.name = 'task';

exports.findOneActiveTask = function(projectId, attributes = ['id']) {
  return models.Task
    .findOne({where: {
      id: projectId,
      deletedAt: null,
    }, attributes: attributes})
    .then((project) => {
      if(!project) throw createError(404, 'Task not found');
      return project;
    });

};

