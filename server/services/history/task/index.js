const { getRequest } = require('./request');
const { getAnswer } = require('./message');
const models = require('../../../models');

module.exports = () => {
  function createResponse(models) {
    return new Promise(resolve => {
      const histories = models.map(model => {
        const answer = getAnswer(model);
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
    call: (taskId, pageSize, currentPage) => {
      const request = getRequest(taskId, pageSize, currentPage);
      return models.ModelHistory
        .findAll(request)
        .then((models) => {
          return createResponse(models);
        });
    }
  };
};
