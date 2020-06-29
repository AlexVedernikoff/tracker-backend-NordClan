module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.describeTable('users').then(async attributes => {
      if (!attributes.allow_vpn) {
        return queryInterface.addColumn('users', 'allow_vpn', {
          type: Sequelize.BOOLEAN,
          allowNull: true
        });
      }
    });
  },

  down: queryInterface => {
    return queryInterface.describeTable('users').then(async attributes => {
      if (attributes.allow_vpn) {
        return queryInterface.removeColumn('users', 'allow_vpn');
      }
    });
  }
};
