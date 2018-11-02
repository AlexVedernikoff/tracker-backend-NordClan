module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn(
      'tasks',
      'is_dev_ops',
      {
        type: Sequelize.BOOLEAN
      }
    ).then(() => queryInterface.sequelize.query(
      'UPDATE tasks SET "is_dev_ops" = false;'
    ));
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn(
      'tasks',
      'is_dev_ops'
    );
  }
};
