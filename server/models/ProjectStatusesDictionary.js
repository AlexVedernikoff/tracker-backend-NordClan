module.exports = function (sequelize, DataTypes) {
  const ProjectStatuses = sequelize.define('ProjectStatusesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_statuses'
  });

  ProjectStatuses.associate = function (models) {
    ProjectStatuses.hasMany(models.Project, {
      as: 'projectStatuses',
      foreignKey: {
        name: 'statusId',
        field: 'status_id'
      }});
  };

  ProjectStatuses.values = [
    {id: 1, name: 'В процессе'},
    {id: 2, name: 'Приостановлен'},
    {id: 3, name: 'Завершен'}
  ];

  ProjectStatuses.IN_PROGRESS = 1;
  ProjectStatuses.STOPPED = 2;
  ProjectStatuses.DONE = 2;

  return ProjectStatuses;
};
