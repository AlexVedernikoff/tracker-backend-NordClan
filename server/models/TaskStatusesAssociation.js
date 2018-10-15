module.exports = function (sequelize, DataTypes) {
  const TaskStatusesAssociation = sequelize.define('TaskStatusesAssociation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    externalStatusId: {
      field: 'external_status_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    internalStatusId: {
      field: 'internal_status_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'task_statuses_association'
  });

  TaskStatusesAssociation.associate = function (models) {
    TaskStatusesAssociation.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    TaskStatusesAssociation.belongsTo(models.TaskStatusesDictionary, {
      as: 'taskStatus',
      foreignKey: {
        name: 'internalStatusId',
        field: 'internal_status_id'
      }});

  };


  return TaskStatusesAssociation;
};


