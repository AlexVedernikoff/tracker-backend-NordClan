const models = require('../');

exports.name = 'comment';

exports.getCommentsByTask = function(taskId) {
  let result = [];
  const where = {
    deletedAt: null,
    taskId
  };

  return models.Comment
    .findAll({
      where: where,
      attributes: models.Comment.defaultSelect,
      order: [
        ['createdAt', 'ASC']
      ]
    })
    .then((models) => {
      models.forEach((model) => {
        result.push(model.dataValues);
      });
      return result;
    });
};

exports.getOne = function(id) {
  const where = {
    deletedAt: null,
    id
  };

  return models.Comment
    .findOne({
      where: where,
      attributes: models.Comment.defaultSelect
    })
    .then((model) => model.dataValues);
};