module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('tasks', 'gitlab_branch_ids', {
      type: Sequelize.JSON,
    });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('tasks', 'gitlab_branch_ids');
  },
};
