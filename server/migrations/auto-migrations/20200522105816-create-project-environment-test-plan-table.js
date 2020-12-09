module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('project_environment_test_plan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      project_environment_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      test_plan_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: queryInterface => queryInterface.dropTable('project_environment_test_plan'),
};
