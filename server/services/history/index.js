const projectInterfaces = require('./project');
const taskInterfaces = require('./task');

async function createResponse (answerBuilder, histories, countAll, pageSize, currentPage) {
  try {
    return await {
      currentPage: currentPage,
      pagesCount: Math.ceil(countAll / pageSize),
      pageSize: pageSize,
      rowsCountAll: countAll,
      rowsCountOnCurrentPage: histories.length,
      data: await Promise.all(histories
        .map(async (model) => {
          const response = await answerBuilder(model);
          return response ? {
            id: model.id,
            date: model.createdAt,
            message: response.message,
            messageEn: response.messageEn,
            entities: response.entities,
            author: model.author,
          } : null;
        })
        .filter(response => response)),
    };
  } catch (error) {
    throw error;
  }
}

module.exports = (entity) => {
  let interfaces = null;
  if (entity === 'task') interfaces = taskInterfaces;
  if (entity === 'project') interfaces = projectInterfaces;
  if (interfaces === null) throw new Error('fail entity');
  const {requestBuilder, messageBuilder, model} = interfaces;

  return {
    call: async (entityId, pageSize, currentPage) => {
      const requestParams = requestBuilder(entityId, pageSize, currentPage);
      const histories = await model.findAll(requestParams);
      const countAll = await model.count(requestParams);

      return await createResponse(messageBuilder, histories, countAll, pageSize, currentPage);
    },
  };
};
