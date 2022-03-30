

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'users', // table name
        'supervisor_id', // new field name
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'supervisor_id');
  },
};
