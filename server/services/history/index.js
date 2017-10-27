const projectRequest = require('./project/request');
const projectAnswer = require('./project/message');
const taskRequest = require('./task/request');
const taskAnswer = require('./task/message');
const models = require('../../models');

module.exports = () => {
  const requestBuilder = {
    task: taskRequest,
    project: projectRequest
  };

  const messageBuilder = {
    task: taskAnswer,
    project: projectAnswer
  };

  function createResponse(entity, models) {
    return new Promise(resolve => {
      const histories = models.map(model => {
        const answer = messageBuilder[entity](model);
        return {
          id: model.id,
          date: model.createdAt,
          message: answer.message,
          entities: answer.entities,
          author: model.author
        };
      });
      resolve(histories);
    });
  }

  return {
    call: (entity, entityId, pageSize, currentPage) => {
      const request = requestBuilder[entity](entityId, pageSize, currentPage);
      return models.ModelHistory
        .findAll(request)
        .then((models) => {
          return createResponse(entity, models);
        });
    }
  };
};
