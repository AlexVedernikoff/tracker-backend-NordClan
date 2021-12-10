

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'departments', // table name
        'isOffice', // new field name
        {
          field: 'is_office',
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('departments', 'is_office');
  },
};
