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
    return models
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
  }

  return {
    call: async (entity, entityId, pageSize, currentPage) => {
      const request = requestBuilder[entity](entityId, pageSize, currentPage);
      const modelName = `${firstLetterUp(entity)}History`;
      const histories = await models[modelName].findAll(request);
      return createResponse(entity, histories);
    }
  };
};
