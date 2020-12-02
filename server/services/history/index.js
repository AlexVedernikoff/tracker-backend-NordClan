const projectRequest = require('./project/request');
const projectAnswer = require('./project/message');
const taskRequest = require('./task/request');
const taskAnswer = require('./task/message');
const models = require('../../models');
const { firstLetterUp } = require('../../components/StringHelper');

async function createResponse (entity, histories, countAll, pageSize, currentPage) {
  try {
    const messageBuilder = {
      task: taskAnswer,
      project: projectAnswer
    };

    return await {
      currentPage: currentPage,
      pagesCount: Math.ceil(countAll / pageSize),
      pageSize: pageSize,
      rowsCountAll: countAll,
      rowsCountOnCurrentPage: histories.length,
      data: await Promise.all(histories
        .map(async (model) => {
          const response = await messageBuilder[entity](model);
          return response ? {
            id: model.id,
            date: model.createdAt,
            message: response.message,
            messageEn: response.messageEn,
            entities: response.entities,
            author: model.author
          } : null;
        })
        .filter(response => response))
    };
  } catch (error) {
    throw error;
  }
}

module.exports = () => {

  const requestBuilder = {
    task: taskRequest,
    project: projectRequest
  };

  return {
    call: async (entity, entityId, pageSize, currentPage) => {
      const request = requestBuilder[entity](entityId, pageSize, currentPage);
      const modelName = `${firstLetterUp(entity)}History`;
      const histories = await models[modelName].findAll(request);
      const countAll = await models[modelName].count(request);

      return await createResponse(entity, histories, countAll, pageSize, currentPage);
    }
  };
};
