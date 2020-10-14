module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('test_suite', 'parent_suite_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('test_suite', 'parent_suite_id');
  }
};
