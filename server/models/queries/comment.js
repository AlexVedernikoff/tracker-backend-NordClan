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
      ],
      include: [
        {
          as: 'author',
          model: models.User,
          required: true,
          attributes: ['id', 'lastNameRu', 'firstNameRu', 'active'],
          paranoid: false
        },
        {
          as: 'parentComment',
          model: models.Project,
          required: false,
          attributes: ['id', 'text'],
          paranoid: false,
          include: [
            {
              as: 'author',
              model: models.User,
              required: true,
              attributes: ['id', 'lastNameRu', 'firstNameRu', 'active'],
              paranoid: false
            }
          ]
        }
      ],
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