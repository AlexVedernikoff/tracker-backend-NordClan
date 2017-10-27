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
    }
  ];
}
