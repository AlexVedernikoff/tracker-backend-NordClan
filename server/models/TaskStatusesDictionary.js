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
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'task_statuses'
  });

  TaskStatuses.values = [
    {id: 1, name: 'New', nameEn: 'New', createDraftByChangesTaskStatus: false, createDraftByCron: false},
    {id: 2, name: 'Develop play', nameEn: 'Develop play', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 3, name: 'Develop stop', nameEn: 'Develop stop', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 4, name: 'Code Review play', nameEn: 'Code Review play', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 5, name: 'Code Review stop', nameEn: 'Code Review stop', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 6, name: 'QA play', nameEn: 'QA play', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 7, name: 'QA stop', nameEn: 'QA stop', createDraftByChangesTaskStatus: true, createDraftByCron: true},
    {id: 8, name: 'Done', nameEn: 'Done', createDraftByChangesTaskStatus: false, createDraftByCron: false},
    {id: 9, name: 'Canceled', nameEn: 'Canceled', createDraftByChangesTaskStatus: false, createDraftByCron: false},
    {id: 10, name: 'Closed', nameEn: 'Closed', createDraftByChangesTaskStatus: false, createDraftByCron: false}
  ];

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
  TaskStatuses.CAN_CREATE_DRAFT_BY_CRON = _.filter(TaskStatuses.values, obj => obj.createDraftByCron === true).map(el => el.id);
  TaskStatuses.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS = _.filter(TaskStatuses.values, obj => obj.createDraftByChangesTaskStatus === true).map(el => el.id);

  return TaskStatuses;
};
