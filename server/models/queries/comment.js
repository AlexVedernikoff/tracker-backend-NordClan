const models = require('../');

exports.name = 'comment';

exports.getCommentsByTask = function(taskId) {
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
    });
};