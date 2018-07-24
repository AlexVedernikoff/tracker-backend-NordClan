module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'projects',
          'external_id',
          {
            type: Sequelize.STRING,
            unique: true
          }
        ),
        queryInterface.addColumn(
          'sprints',
          'external_id',
          {
            type: Sequelize.STRING,
            unique: true
          }
        ),
        queryInterface.addColumn(
          'tasks',
          'external_id',
          {
            type: Sequelize.STRING,
            unique: true
          }
        ),
        queryInterface.addColumn(
          'timesheets',
          'external_id',
          {
            type: Sequelize.STRING,
            unique: true
          }
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'projects',
          'external_id'
        ),
        queryInterface.removeColumn(
          'sprints',
          'external_id'
        ),
        queryInterface.removeColumn(
          'tasks',
          'external_id'
        ),
        queryInterface.removeColumn(
          'timesheets',
          'external_id'
        )
      ]));
  }
};
