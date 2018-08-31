module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'tasks',
          'gitlab_branch_ids',
          {
            type: Sequelize.JSON
          }
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'tasks',
          'gitlab_branch_ids'
        )
      ]));
  }
};

