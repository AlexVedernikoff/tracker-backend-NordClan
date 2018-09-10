module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'users',
          'description',
          {
            type: Sequelize.STRING
          }
        )
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'users',
          'description'
        )
      ]));
  }
};
