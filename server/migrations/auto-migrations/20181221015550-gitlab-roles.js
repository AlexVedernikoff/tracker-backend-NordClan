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
        },
        access_level: {
          type: Sequelize.INTEGER
        }
      }))
      .then(() => queryInterface.bulkInsert('gitlab_roles', [
        { code_name: 'GUEST', name: 'guest', access_level: 10 },
        { code_name: 'DEVELOPER', name: 'developer', access_level: 20 },
        { code_name: 'REPORTER', name: 'reporter', access_level: 30 },
        { code_name: 'MAINTAINER', name: 'maintainer', access_level: 40 }
      ], {}));
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('gitlab_roles');
  }
};
