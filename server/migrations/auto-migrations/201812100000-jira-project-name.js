module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'projects',
      'jira_project_name',
      {
        type: Sequelize.STRING
      }
    );
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn(
      'projects',
      'jira_project_name'
    );
  }
};