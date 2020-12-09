module.exports = function (sequelize, DataTypes) {
  const TimesheetDraft = sequelize.define('TimesheetDraft', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    onDate: {
      field: 'on_date',
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: false,
    },
    typeId: {
      field: 'type_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taskStatusId: {
      type: DataTypes.INTEGER,
      field: 'task_status_id',
      allowNull: true,
    },
    isVisible: {
      field: 'is_visible',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  }, {
    underscored: true,
    timestamps: true,
    paranoid: false,
    tableName: 'timesheets_draft',
  });

  TimesheetDraft.associate = function (models) {
    TimesheetDraft.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'taskId',
        field: 'task_id',
        allowNull: false,
      },
    });

    TimesheetDraft.belongsTo(models.Project, {
      as: 'projectMaginActivity',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
        allowNull: true,
      },
    });

    TimesheetDraft.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
    });

    TimesheetDraft.belongsTo(models.TimesheetTypesDictionary, {
      as: 'type',
      foreignKey: {
        name: 'typeId',
        field: 'type_id',
        allowNull: false,
      },
    });

    TimesheetDraft.belongsTo(models.TaskStatusesDictionary, {
      as: 'taskStatus',
      foreignKey: {
        name: 'taskStatusId',
        field: 'task_status_id',
        allowNull: false,
      },
    });

  };

  return TimesheetDraft;
};
