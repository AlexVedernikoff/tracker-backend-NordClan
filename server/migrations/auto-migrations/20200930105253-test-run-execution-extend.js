

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('test_run_execution', 'title', {
      type: Sequelize.STRING,
      defaultValue: '',
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    });
    queryInterface.addColumn('test_run_execution', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      trim: true
    });
    queryInterface.changeColumn('test_run_execution', 'test_run_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('test_run_execution', 'title');
    queryInterface.removeColumn('test_run_execution', 'description');
    queryInterface.changeColumn('test_run_execution', 'test_run_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }

};
