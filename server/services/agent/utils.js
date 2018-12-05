const { ProjectUsers, ProjectUsersRoles, Task, Timesheet, TaskStatusesDictionary, ProjectStatusesDictionary,
  User, MetricTypesDictionary, TaskTypesDictionary, Project, Sprint, TaskTasks, TaskHistory, sequelize } = require('../../models');

exports.getProjectIds = async function (projectId) {
  if (projectId) {
    return [projectId];
  }

  return await Project.findAll({
    attributes: ['id'],
    where: {
      statusId: ProjectStatusesDictionary.IN_PROGRESS
    }
  }).then((projects) => projects.map(project => project.id));
};

exports.getProject = async function (projectId) {
  return await Project.findOne({
    where: {
      id: projectId
    },
    attributes: Project.defaultSelect,
    include: [
      {
        as: 'sprints',
        model: Sprint,
        attributes: Sprint.defaultSelect,
        where: {
          statusId: 2
        },
        include: [
          {
            as: 'tasks',
            model: Task,
            attributes: Task.defaultSelect,
            where: {
              deletedAt: {
                $eq: null
              }
            },
            include: [
              {
                as: 'linkedTasks', // Связанные с задачей баги
                model: Task,
                attributes: ['id', 'createdAt'],
                through: {
                  model: TaskTasks,
                  attributes: []
                },
                where: {
                  statusId: {
                    $notIn: [ TaskStatusesDictionary.CANCELED_STATUS ]
                  },
                  typeId: {
                    $in: [TaskTypesDictionary.BUG, TaskTypesDictionary.REGRES_BUG]
                  }
                },
                required: false
              },
              {
                as: 'history',
                model: TaskHistory,
                where: {
                  field: {
                    $or: ['sprintId', 'statusId', 'performerId', null]
                  }
                },
                required: false
              },
              {
                as: 'timesheets',
                model: Timesheet,
                attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable', 'userId', 'onDate', 'taskStatusId', 'taskId'],
                required: false
              }
            ],
            required: false
          }
        ]
      }
    ],
    logging: false
  })
    .then((project) => project && project.get({ 'plain': true }));
};

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
  return await sequelize.query('select ROUND(sum(fact_execution_time)/count(*), 2) as time_by_bugs from tasks where type_id = :type_id and project_id = :project_id and status_id = :status_id', {
    replacements: {
      type_id: taskTypeBug[0].id,
      project_id: +projectId,
      status_id: +taskStatusDone[0].id
    },
    logging: false
  })
    .spread((results) => {
      return results[0] && results[0].time_by_bugs || '0';
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


