

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('test_run_execution', 'project_environment_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    queryInterface.addColumn('test_run_execution', 'executor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
      },
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('test_run_execution', 'project_environment_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    queryInterface.removeColumn('test_run_execution', 'executor_id');
  },
};
