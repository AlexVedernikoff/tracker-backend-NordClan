const Sequelize = require('sequelize');
const models = require('../../../models');

module.exports = function(projectId, pageSize, currentPage) {
  return {
    where: { projectId: projectId },
    limit: pageSize,
    offset: currentPage > 0 ? + pageSize * (+currentPage - 1) : 0,
    order: [['createdAt', 'DESC']],
    include: additionalEntities()
  };
};

function additionalEntities() {
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
      // where: { id: Sequelize.col('project_histories.entity_id') },
      // where: Sequelize.literal('"ProjectHistory"."entity_id" = "Sprint"."sprint_id"'),
      // attributes: models.Sprint.defaultSelect,
      required: false,
      paranoid: false,
    },
    {
      as: 'user',
      model: models.ProjectUsers,
      // where: { id: Sequelize.col('project_histories.entity_id') },
      // where: Sequelize.literal('"ProjectHistory"."entity_id" = "Sprint"."sprint_id"'),
      attributes: ['roles_ids'],
      required: false,
      paranoid: false,
      include: [
        {
          as: 'user',
          model: models.User
        }
      ]
    }
  ];
}
