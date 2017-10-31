const projectRequest = require('./project/request');
const projectAnswer = require('./project/message');
const taskRequest = require('./task/request');
const taskAnswer = require('./task/message');
const models = require('../../models');
const { firstLetterUp } = require('../../components/StringHelper');

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
      const histories = models
        .map(model => {
          const response = messageBuilder[entity](model);
          return response ? {
            id: model.id,
            date: model.createdAt,
            message: response.message,
            entities: response.entities,
            author: model.author
          } : null;
        })
        .filter(response => response);

      resolve(histories);
    });
  }

  return {
    call: (entity, entityId, pageSize, currentPage) => {
      const request = requestBuilder[entity](entityId, pageSize, currentPage);
      const modelName = `${firstLetterUp(entity)}History`;
      return models[modelName]
        .findAll(request)
        .then((models) => {
          return createResponse(entity, models);
        });
    }
  };
};
