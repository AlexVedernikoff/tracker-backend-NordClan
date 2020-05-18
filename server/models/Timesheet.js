const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');
const beforeValidate = require('../components/sequelizeHooks/TimesheetBeforeValidate');

module.exports = function (sequelize, DataTypes) {
  const Timesheet = sequelize.define('Timesheet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    sprintId: {
      field: 'sprint_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    onDate: {
      field: 'on_date',
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    typeId: {
      field: 'type_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spentTime: {
      field: 'spent_time',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      trim: true,
      allowNull: true
    },
    isBillable: {
      field: 'is_billable',
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    userRoleId: {
      field: 'user_role_id',
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvedByUserId: {
      field: 'approved_by_user_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    taskStatusId: {
      type: DataTypes.INTEGER,
      field: 'task_status_id',
      allowNull: true
    },
    statusId: {
      type: DataTypes.INTEGER,
      field: 'status_id',
      allowNull: true,
      defaultValue: 1
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isVisible: {
      field: 'is_visible',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    externalId: {
      field: 'external_id',
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
  }, {
    underscored: true,
    timestamps: true,
    paranoid: false,
    tableName: 'timesheets',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });

  Timesheet.associate = function (models) {
    Timesheet.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'taskId',
        field: 'task_id',
        allowNull: false
      }
    });

    Timesheet.belongsTo(models.Sprint, {
      as: 'sprint',
      foreignKey: {
        name: 'sprintId',
        field: 'sprint_id',
        allowNull: false
      }
    });

    // Устроело, но используется DEPRECATED
    Timesheet.belongsTo(models.Project, {
      as: 'projectMaginActivity',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
        allowNull: true
      },
      constraints: false
    });

    Timesheet.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
        allowNull: true
      },
      constraints: false
    });

    Timesheet.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false
      }
    });

    Timesheet.belongsTo(models.TimesheetTypesDictionary, {
      as: 'type',
      foreignKey: {
        name: 'typeId',
        field: 'type_id',
        allowNull: false
      }
    });

    Timesheet.belongsTo(models.ProjectRolesDictionary, {
      as: 'userRole',
      foreignKey: {
        name: 'userRoleId',
        field: 'user_role_id',
        allowNull: false
      },
      constraints: false
    });

    Timesheet.belongsTo(models.TaskStatusesDictionary, {
      as: 'taskStatus',
      foreignKey: {
        name: 'taskStatusId',
        field: 'task_status_id',
        allowNull: false
      }
    });

    Timesheet.belongsTo(models.TimesheetStatusesDictionary, {
      as: 'timesheetStatus',
      foreignKey: {
        name: 'statusId',
        field: 'status_id',
        allowNull: false
      }
    });

  };

  /* При создании тайм шита вставляем в запись недостающие данные */
  Timesheet.addHook('beforeValidate', 'beforeValidate', beforeValidate.index);
  Timesheet.addMeticNeedUpdateHook();

  return Timesheet;
};
