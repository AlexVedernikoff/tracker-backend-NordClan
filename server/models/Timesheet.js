const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');
const _ = require('underscore');
const moment = require('moment');

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
      allowNull: false,
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    onDate: {
      field: 'on_date',
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    typeId: {
      field: 'type_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spentTime: {
      field: 'spent_time',
      type: DataTypes.FLOAT,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      trim: true,
      allowNull: false,
      // validate: {
      //   len: [1, 500]
      // }
    },
    isBillible: {
      field: 'is_billible',
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    userRoleId: {
      field: 'user_role_id',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    taskStatusId: {
      type: DataTypes.INTEGER,
      field: 'task_status_id',
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      field: 'status_id',
      allowNull: false,
    },
    isVisible: {
      field: 'is_visible',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
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
        allowNull: false,
      }
    });

    Timesheet.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      }
    });

    Timesheet.belongsTo(models.TimesheetTypesDictionary, {
      as: 'type',
      foreignKey: {
        name: 'typeId',
        field: 'type_id',
        allowNull: false,
      }
    });

    Timesheet.belongsTo(models.ProjectRolesDictionary, {
      as: 'userRole',
      foreignKey: {
        name: 'userRoleId',
        field: 'user_role_id',
        allowNull: false,
      },
      constraints: false
    });

    Timesheet.belongsTo(models.TaskStatusesDictionary, {
      as: 'taskStatus',
      foreignKey: {
        name: 'taskStatusId',
        field: 'task_status_id',
        allowNull: false,
      }
    });

    Timesheet.belongsTo(models.TimesheetStatusesDictionary, {
      as: 'timesheetStatus',
      foreignKey: {
        name: 'statusId',
        field: 'status_id',
        allowNull: false,
      }
    });

  };

  return Timesheet;
};
