module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'projects',
          'type_id',
          {
            type: Sequelize.INTEGER,
          }
        ),
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'projects',
          'type_id'
        ),
      ]));
  },
};
