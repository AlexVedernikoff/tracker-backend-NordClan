module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('timesheets', 'approved_by_user_id', { type: Sequelize.INTEGER });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('timesheets', 'approved_by_user_id');
  },
};
