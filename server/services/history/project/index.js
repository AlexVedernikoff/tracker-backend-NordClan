const getRequest = require('../../../services/history/project/request');
const getAnswer = require('../../../services/history/project/message');
const models = require('../../../models');

module.export = function(taskId, pageSize, currentPage) {
  return {
    call: () => {
      const request = getRequest(taskId, pageSize, currentPage);
      models.ModelHistory
        .findAll(request)
        .then((models) => {
          return models.map(model => {
            const answer = getAnswer(model);
            return {
              id: model.id,
              date: model.createdAt,
              message: answer.message,
              entities: answer.entities,
              author: model.author
            };
          });
        });
    }
  };
};
