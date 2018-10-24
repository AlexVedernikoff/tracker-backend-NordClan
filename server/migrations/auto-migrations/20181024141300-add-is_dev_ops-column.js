module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'tasks',
          'is_dev_ops',
          {
            type: Sequelize.BOOLEAN
          }
        )
      ]))
      .then(() => Promise.all([
        queryInterface.sequelize.query(
          'UPDATE tasks SET "is_dev_ops" = false;'
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'tasks',
          'is_dev_ops'
        )
      ]));
  }
};
