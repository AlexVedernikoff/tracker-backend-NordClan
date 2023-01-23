module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'external_user_type', {
      type: Sequelize.ENUM('Client', 'Performer', 'None'),
      defaultValue: 'None',
    });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('users', 'external_user_type');
  },
};