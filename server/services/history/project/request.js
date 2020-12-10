const Sequelize = require('sequelize');
const models = require('../../../models');

module.exports = function (projectId, pageSize, currentPage) {
  return {
    where: { projectId: projectId },
    limit: pageSize,
    offset: currentPage > 0 ? +pageSize * (+currentPage - 1) : 0,
    order: [['createdAt', 'DESC']],
    include: additionalEntities(),
  };
};

function additionalEntities () {
  return [
    {
      as: 'author',
      model: models.User,
      attributes: models.User.defaultSelect,
      paranoid: false,
      required: false,
    },
    {
      as: 'sprint',
      model: models.Sprint,
      required: false,
      paranoid: false,
    },
    {
      as: 'project_user',
      model: models.ProjectUsers,
      attributes: models.ProjectUsers.defaultSelect,
      required: false,
      paranoid: false,
      include: {
        as: 'user',
        model: models.User,
        attributes: models.User.defaultSelect,
        required: false,
        paranoid: false,
      },
    },
    {
      as: 'itemTag',
      model: models.ItemTag,
      where: Sequelize.literal('"ProjectHistory"."entity" = \'ItemTag\''),
      required: false,
      paranoid: false,
      include: [
        {
          as: 'tag',
          model: models.Tag,
          attributes: ['name'],
          required: false,
          paranoid: false,
        },
      ],
    },
    {
      as: 'portfolio',
      model: models.Portfolio,
      attributes: ['id', 'name'],
      required: false,
      paranoid: false,
    },
  ];
}
