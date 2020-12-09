module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'users',
      'description',
      {
        type: Sequelize.TEXT,
      }
    );
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'users',
      'description',
      {
        type: Sequelize.STRING,
      });
  },
};
