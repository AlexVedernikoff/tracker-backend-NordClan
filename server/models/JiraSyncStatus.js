module.exports = function (sequilize, DataTypes) {
  const JiraSyncStatus = sequilize.define('JiraSyncStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    jiraProjectId: {
      field: 'jira_project_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      field: 'date',
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      field: 'status',
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'jira_sync_status',
    timestamp: true,
    updatedAt: false,
    createdAt: false
  });

  JiraSyncStatus.associate = function (models) {
    JiraSyncStatus.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'simtrackProjectId',
        field: 'simtrack_project_id',
        allowNull: false
      }
    });
  };

  return JiraSyncStatus;
};
