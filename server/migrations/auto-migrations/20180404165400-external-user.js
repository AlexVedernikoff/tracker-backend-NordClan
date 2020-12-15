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
          enumName: 'global_role_type',
        }),
        queryInterface.addColumn(
          'users',
          'password',
          {
            type: Sequelize.STRING(100),
          }
        ),
        queryInterface.addColumn(
          'users',
          'set_password_token',
          {
            type: Sequelize.STRING(100),
          }
        ),
        queryInterface.addColumn(
          'users',
          'set_password_expired',
          {
            type: Sequelize.DATE,
          }
        ),
        queryInterface.addColumn(
          'users',
          'expired_date',
          {
            type: Sequelize.STRING(100),
          }
        ),
        queryInterface.addIndex(
          'users',
          {
            name: 'login_unique',
            unique: true,
            fields: ['login'],
          }
        ),
        queryInterface.bulkInsert('project_roles', [{
          id: 11,
          code: 'customer',
          name: 'Customer',
        }]),
      ]));
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
          enumName: 'global_role_type',
        }),
        queryInterface.removeColumn(
          'users',
          'password'
        ),
        queryInterface.removeColumn(
          'users',
          'set_password_token'
        ),
        queryInterface.removeColumn(
          'users',
          'expired_date'
        ),
        queryInterface.removeColumn(
          'users',
          'set_password_expired'
        ),
        queryInterface.removeIndex(
          'users',
          'login_unique'
        ),
        queryInterface.bulkDelete('project_roles', {
          id: 11,
        }),
      ]));
  },
};
