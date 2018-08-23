module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'projects',
          'gitlab_project_ids',
          {
            type: Sequelize.ARRAY(Sequelize.INTEGER)
          }
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'projects',
          'gitlab_project_ids'
        )
      ]));
  }
};
