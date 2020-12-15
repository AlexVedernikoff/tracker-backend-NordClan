module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('projects', 'jira_token', {
      type: Sequelize.STRING,
      unique: false,
    });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('projects', 'jira_token');
  },
};
