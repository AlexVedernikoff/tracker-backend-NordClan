
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'company', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('users', 'company');
  },
};
