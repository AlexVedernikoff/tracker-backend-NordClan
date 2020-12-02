module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'task_histories',
          'value_boolean',
          {
            type: Sequelize.BOOLEAN
          }
        ),
        queryInterface.addColumn(
          'task_histories',
          'prev_value_boolean',
          {
            type: Sequelize.BOOLEAN
          }
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'task_histories',
          'value_boolean'
        ),
        queryInterface.removeColumn(
          'task_histories',
          'prev_value_boolean'
        )
      ]));
  }
};
