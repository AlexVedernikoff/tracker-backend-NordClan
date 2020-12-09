const models = require('../');

exports.name = 'comment';

const include = [
  {
    as: 'author',
    model: models.User,
    required: true,
    attributes: models.User.defaultSelect,
    paranoid: false,
  },
  {
    as: 'parentComment',
    model: models.Comment,
    required: false,
    attributes: models.Comment.defaultSelect,
    paranoid: false,
    include: [
      {
        as: 'author',
        model: models.User,
        required: false,
        attributes: models.User.defaultSelect,
        paranoid: false,
      },
    ],
  },
];

exports.getCommentsByTask = function (taskId) {
  const where = {
    deletedAt: null,
    taskId,
  };

  return models.Comment
    .findAll({
      where: where,
      attributes: models.Comment.defaultSelect,
      order: [
        ['createdAt', 'ASC'],
      ],
      include,
    });
};

exports.getOne = function (id) {
  const where = {
    deletedAt: null,
    id,
  };

  return models.Comment
    .findOne({
      where: where,
      attributes: models.Comment.defaultSelect,
      include,
    });
};
