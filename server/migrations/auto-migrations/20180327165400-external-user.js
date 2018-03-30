const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        replaceEnum({
          queryInterface,
          tableName: 'users',
          columnName: 'global_role',
          defaultValue: 'USER',
          newValues: ['ADMIN', 'VISOR', 'USER', 'EXTERNAL_USER'],
          enumName: 'global_role_type'
        })
      ]))
      .then(() => Promise.all([
        queryInterface.addColumn(
          'users',
          'password',
          {
            type: Sequelize.STRING(100)
          }
        )
      ]))
      .then(() => Promise.all([
        queryInterface.addColumn(
          'users',
          'set_password_token',
          {
            type: Sequelize.STRING(100)
          }
        )
      ]))
      .then(() => Promise.all([
        queryInterface.addColumn(
          'users',
          'set_password_expired',
          {
            type: Sequelize.DATE
          }
        )
      ]))
      .then(() => Promise.all([
        queryInterface.addColumn(
          'users',
          'expired_date',
          {
            type: Sequelize.STRING(100)
          }
        )
      ]))
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        replaceEnum({
          queryInterface,
          tableName: 'users',
          columnName: 'global_role',
          defaultValue: 'USER',
          newValues: ['ADMIN', 'VISOR', 'USER'],
          enumName: 'global_role_type'
        })
      ]))
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'users',
          'password'
        )
      ]))
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'users',
          'set_password_token'
        )
      ]))
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'users',
          'expired_date'
        )
      ]))
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'users',
          'set_password_expired'
        )
      ]));
  }
};
