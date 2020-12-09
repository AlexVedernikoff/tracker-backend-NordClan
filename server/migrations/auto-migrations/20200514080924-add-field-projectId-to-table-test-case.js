module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable('test_case').then(async attributes => {
      if (!attributes.project_id) {
        queryInterface.addColumn('test_case', 'project_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
      if (attributes.expected_result) {
        queryInterface.removeColumn('test_case', 'expected_result');
      }
      return queryInterface;
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.describeTable('test_case').then(async attributes => {
      if (attributes.project_id) {
        queryInterface.removeColumn('test_case', 'project_id');
      }
      if (!attributes.expected_result) {
        queryInterface.addColumn('test_case', 'expected_result', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      return queryInterface;
    });
  },
};
