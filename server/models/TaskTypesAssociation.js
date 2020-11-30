module.exports = function (sequelize, DataTypes) {
  const TaskTypesAssociation = sequelize.define('TaskTypesAssociation', {
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
    externalTaskTypeId: {
      field: 'external_task_type_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    internalTaskTypeId: {
      field: 'internal_task_type_id',
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
    tableName: 'task_types_association'
  });

  TaskTypesAssociation.associate = function (models) {
    TaskTypesAssociation.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    TaskTypesAssociation.belongsTo(models.TaskTypesDictionary, {
      as: 'taskType',
      foreignKey: {
        name: 'internalTaskTypeId',
        field: 'internal_task_type_id'
      }});

  };

  return TaskTypesAssociation;
};


