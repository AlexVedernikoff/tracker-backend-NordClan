const { ProjectUsers, ProjectUsersRoles, Task, Timesheet, TaskStatusesDictionary,
  User, MetricTypesDictionary, TaskTypesDictionary } = require('../../models');

exports.getDictionaries = async function () {
  const bugNameEn = 'Bug';
  const taskStatusDoneEn = 'Done';
  return await Promise.all([
    TaskTypesDictionary.findAll({ where: { name_en: bugNameEn } }),
    TaskStatusesDictionary.findAll({ where: { name: taskStatusDoneEn } }),
    MetricTypesDictionary.findAll()
  ]);
};

exports.getBugs = async function (projectId, taskTypeBug, taskStatusDone) {
  return await Task.findAll({
    where: {
      typeId: taskTypeBug[0].id,
      statusId: taskStatusDone[0].id,
      projectId: projectId
    },
    attributes: ['id', 'sprintId', 'projectId', 'factExecutionTime'],
    logging: false
  });
};

exports.getTasksInBacklog = async function (projectId) {
  return await Task.findAll({
    where: {
      sprintId: null,
      projectId: projectId
    },
    attributes: ['id', 'sprintId', 'projectId', 'typeId', 'statusId', 'isTaskByClient'],
    include: [
      {
        as: 'timesheets',
        model: Timesheet,
        attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable'],
        required: false
      }
    ],
    logging: false
  }).then(tasks => tasks
    .map(task => task.get({ 'plain': true }))
  );
};

exports.getOtherTimeSheets = async function (projectId) {
  return await Timesheet.findAll({
    where: {
      taskId: null,
      projectId: projectId
    },
    attributes: ['id', 'projectId', 'spentTime'],
    logging: false
  }).then(timesheets => timesheets.map(timesheet => timesheet.get({ 'plain': true })));
};

exports.getProjectUsers = async function (projectId) {
  return await ProjectUsers.findAll({
    attributes: [],
    where: {
      projectId: projectId
    },
    include: [
      {
        as: 'user',
        model: User
      },
      {
        as: 'roles',
        model: ProjectUsersRoles
      }
    ],
    logging: false
  }).then(users => users
    .map(user => user.get({ 'plain': true }))
  );
};


