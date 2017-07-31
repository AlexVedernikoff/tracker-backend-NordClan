const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');
const _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  const Timesheet = sequelize.define('Timesheet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
      type: DataTypes.DATE,
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
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'timesheets',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });
  
  Timesheet.associate = function(models) {
    Timesheet.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'taskId',
        field: 'task_id',
        allowNull: false,
      }});
  
    Timesheet.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      }});
  
    Timesheet.belongsTo(models.TimesheetTypesDictionary, {
      as: 'type',
      foreignKey: {
        name: 'typeId',
        field: 'type_id',
        allowNull: false,
      }});
    
  };
  
  return Timesheet;
};
