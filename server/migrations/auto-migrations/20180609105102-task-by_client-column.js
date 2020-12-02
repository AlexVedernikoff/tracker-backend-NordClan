module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'tasks',
          'is_task_by_client',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          }
        ).catch
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'tasks',
          'is_task_by_client'
        )
      ]));
  }
};
