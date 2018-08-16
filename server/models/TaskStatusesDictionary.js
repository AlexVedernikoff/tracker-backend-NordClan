const _ = require('underscore');

const TASK_STATUS_NEW = 1;
const TASK_STATUS_DEVELOP_PLAY = 2;
const TASK_STATUS_DEVELOP_STOP = 3;
const TASK_STATUS_CODE_REVIEW_PLAY = 4;
const TASK_STATUS_CODE_REVIEW_STOP = 5;
const TASK_STATUS_QA_PLAY = 6;
const TASK_STATUS_QA_STOP = 7;
const TASK_STATUS_DONE = 8;
const TASK_STATUS_CANCELED = 9;
const TASK_STATUS_CLOSED = 10;

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

  TaskStatuses.DEVELOP_STATUSES = [TASK_STATUS_DEVELOP_PLAY, TASK_STATUS_DEVELOP_STOP];
  TaskStatuses.CODE_REVIEW_STATUSES = [TASK_STATUS_CODE_REVIEW_PLAY, TASK_STATUS_CODE_REVIEW_STOP];
  TaskStatuses.QA_STATUSES = [TASK_STATUS_QA_PLAY, TASK_STATUS_DEVELOP_STOP];
  TaskStatuses.DONE_STATUS = TASK_STATUS_DONE;
  TaskStatuses.CANCELED_STATUS = TASK_STATUS_CANCELED;
  TaskStatuses.CLOSED_STATUS = TASK_STATUS_CLOSED;
  TaskStatuses.NOT_AVAILABLE_STATUSES = [
    TaskStatuses.DONE_STATUS,
    TaskStatuses.CANCELED_STATUS,
    TaskStatuses.CLOSED_STATUS
  ];
  TaskStatuses.DONE_STATUSES = [ // Готовые и закрытые задачи
    TaskStatuses.DONE_STATUS,
    TaskStatuses.CLOSED_STATUS
  ];
  TaskStatuses.CAN_CREATE_DRAFT_BY_CRON = [
    TASK_STATUS_DEVELOP_PLAY,
    TASK_STATUS_DEVELOP_STOP,
    TASK_STATUS_CODE_REVIEW_PLAY,
    TASK_STATUS_CODE_REVIEW_STOP,
    TASK_STATUS_QA_PLAY
  ];
  TaskStatuses.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS = [
    TASK_STATUS_DEVELOP_PLAY,
    TASK_STATUS_DEVELOP_STOP,
    TASK_STATUS_CODE_REVIEW_PLAY,
    TASK_STATUS_CODE_REVIEW_STOP,
    TASK_STATUS_QA_PLAY
  ];

  return TaskStatuses;
};
