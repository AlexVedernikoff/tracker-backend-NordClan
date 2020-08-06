module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_plan_test_cases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_plan_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      test_case_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      assigned_to: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => queryInterface.dropTable('test_plan_test_cases')
};
