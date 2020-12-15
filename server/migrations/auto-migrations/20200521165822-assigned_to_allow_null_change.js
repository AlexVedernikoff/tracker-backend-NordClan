module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable('test_plan_test_cases').then(attributes => {
      if (attributes.assigned_to) {
        return queryInterface.changeColumn('test_plan_test_cases', 'assigned_to', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.describeTable('test_plan_test_cases').then(attributes => {
      if (attributes.assigned_to) {
        return queryInterface.changeColumn('test_plan_test_cases', 'assigned_to', {
          type: Sequelize.INTEGER,
          allowNull: false,
        });
      }
    });
  },
};
