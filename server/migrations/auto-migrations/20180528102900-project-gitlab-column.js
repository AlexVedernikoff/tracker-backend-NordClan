module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('projects', 'gitlab_project_ids', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('projects', 'gitlab_project_ids');
  },
};
