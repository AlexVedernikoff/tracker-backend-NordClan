module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('test_suite', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('test_case', ['project_id']);
    return queryInterface.addIndex('test_suite', ['project_id']);
  },

  down: async function (queryInterface) {
    await queryInterface.removeIndex('test_case', ['project_id']);
    await queryInterface.removeIndex('test_suite', ['project_id']);
    return queryInterface.removeColumn('test_suite', 'project_id');
  },
};
