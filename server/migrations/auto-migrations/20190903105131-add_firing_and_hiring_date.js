module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'employment_date', { type: Sequelize.DATE });
    await queryInterface.addColumn('users', 'dismissal_date', { type: Sequelize.DATE });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'employment_date');
    await queryInterface.removeColumn('users', 'dismissal_date');
  }
};
