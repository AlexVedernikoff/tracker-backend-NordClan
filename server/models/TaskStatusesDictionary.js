const _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
  const TaskStatuses = sequelize.define('TaskStatusesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    },
    nameEn: {
      field: 'name_en',
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
    tableName: 'task_statuses'
  });

  TaskStatuses.DEVELOP_STATUSES = [2, 3];
  TaskStatuses.CODE_REVIEW_STATUSES = [4, 5];
  TaskStatuses.QA_STATUSES = [6, 7];
  TaskStatuses.DONE_STATUS = 8;
  TaskStatuses.CANCELED_STATUS = 9;
  TaskStatuses.CLOSED_STATUS = 10;
  TaskStatuses.NOT_AVAILABLE_STATUSES = [
    TaskStatuses.DONE_STATUS,
    TaskStatuses.CANCELED_STATUS,
    TaskStatuses.CLOSED_STATUS
  ];
  TaskStatuses.DONE_STATUSES = [ // Готовые и закрытые задачи
    TaskStatuses.DONE_STATUS,
    TaskStatuses.CLOSED_STATUS
  ];
  TaskStatuses.CAN_CREATE_DRAFT_BY_CRON = [2, 3, 4, 5, 6];
  TaskStatuses.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS = [2, 3, 4, 5, 6];

  return TaskStatuses;
};
