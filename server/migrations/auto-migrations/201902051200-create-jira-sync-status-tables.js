module.exports = {
  up: function (queryInterfaces, Sequelize) {
    return queryInterfaces.createTable('jira_sync_status', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      simtrack_project_Id: {
        field: 'simtrack_project_id',
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'projects', key: 'id' }
      },
      jira_project_Id: {
        field: 'jira_project_id',
        type: Sequelize.INTEGER
      },
      date: {
        field: 'date',
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        field: 'status',
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('jira_sync_status');
  }
};
