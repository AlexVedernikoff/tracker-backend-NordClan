module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(() => queryInterface.createTable('gitlab_roles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        code_name: {
          type: Sequelize.STRING
        }
      }))
      .then(() => queryInterface.bulkInsert('gitlab_roles', [
        { code_name: 'GUEST', name: 'guest' },
        { code_name: 'DEVELOPER', name: 'developer' },
        { code_name: 'REPORTER', name: 'reporter' },
        { code_name: 'MAINTAINER', name: 'maintainer' }
      ], {}));
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('gitlab_roles');
  }
};
