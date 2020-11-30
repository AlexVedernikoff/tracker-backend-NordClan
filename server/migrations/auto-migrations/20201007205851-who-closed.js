

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('test_case_execution', 'who_closed', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        isInt: true
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('test_case_execution', 'who_closed');
  }
};
