const moment = require('moment');
const { Project, ProjectUsers, ProjectUsersRoles, Sprint, Task, Timesheet, TaskHistory, TaskStatusesDictionary,
  User, Metrics, MetricTypesDictionary, sequelize, TaskTypesDictionary, TaskTasks } = require('../../../models');
const metricsLib = require('./metricsLib');

const executeDate = moment().toISOString();

module.exports.calculate = async function (projectId) {
  try {
    await init();
    const metricsData = await getMetrics(projectId);
    await saveMetrics(metricsData);
    process.exit(0);

  } catch (err) {
    console.error('Error. Can not calculate metrics. Reason: ', err);
    // TODO: send email about error, task ST-6631
    process.exit(-1);
  }
};

async function init () {
  return await sequelize.authenticate();
}

async function getMetrics (projectId) {
  const projectsQuery = {
    where: {
      ...(projectId ? {
        id: { $eq: projectId }
      } : null)
    },
    attributes: Project.defaultSelect,
    include: [
      {
        as: 'sprints',
        model: Sprint,
        attributes: Sprint.defaultSelect,
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
                  field: 'sprintId'
                },
                required: false
              },
              {
                as: 'timesheets',
                model: Timesheet,
                attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable', 'userId', 'onDate', 'taskStatusId'],
                required: false
              }
            ],
            required: false
          }
        ]
      },
      {
        as: 'projectUsers',
        model: ProjectUsers,
        attributes: ProjectUsers.defaultSelect,
        include: [
          {
            as: 'user',
            model: User
          },
          {
            as: 'roles',
            model: ProjectUsersRoles
          }
        ]
      }
    ],
    subQuery: true
  };

  const projects = await Project.findAll(projectsQuery);

  const bugNameEn = 'Bug';
  const taskStatusDoneEn = 'Done';
  const [taskTypeBug, taskStatusDone, metricTypes] = await Promise.all([
    TaskTypesDictionary.findAll({ where: { name_en: bugNameEn } }),
    TaskStatusesDictionary.findAll({ where: { name: taskStatusDoneEn } }),
    MetricTypesDictionary.findAll()
  ]);

  const bugs = await Task.findAll({
    where: {
      typeId: taskTypeBug[0].id,
      statusId: taskStatusDone[0].id
    },
    attributes: ['id', 'sprintId', 'projectId', 'factExecutionTime']
  });

  const tasksInBacklog = await Task.findAll({
    where: {
      sprintId: null
    },
    attributes: ['id', 'sprintId', 'projectId', 'typeId', 'statusId', 'isTaskByClient'],
    include: [
      {
        as: 'timesheets',
        model: Timesheet,
        attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable'],
        required: false
      }
    ]
  }).then(tasks => tasks
    .map(task => task.get({ 'plain': true })));

  const otherTimeSheets = await Timesheet.findAll({
    where: {
      taskId: null
    },
    attributes: ['id', 'projectId', 'spentTime']
  }).then(timesheets => timesheets
    .map(timesheet => timesheet.get({ 'plain': true })));

  const projectMetricsTasks = [];
  projects.forEach(function (project) {
    const plainProject = project.get({ 'plain': true });
    plainProject.tasksInBacklog = tasksInBacklog.filter(task => task.projectId === plainProject.id);
    plainProject.bugs = bugs.filter(bug => bug.projectId === plainProject.id);
    plainProject.otherTimeSheets = otherTimeSheets.filter(timesheet => timesheet.projectId === plainProject.id);
    if (plainProject.sprints.length > 0) {
      plainProject.sprints.forEach(function (sprint, sprintKey) {
        plainProject.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
        plainProject.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
        plainProject.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
      });
    }
    metricTypes.forEach(function (value) {
      if (value.id > 29 && value.id !== 57) { return; }
      projectMetricsTasks.push(metricsLib(value.id, {
        project: plainProject,
        executeDate
      }));
    });
    if (plainProject.sprints.length > 0) {
      plainProject.sprints.forEach(function (sprint) {
        metricTypes.forEach(function (value) {
          if (((value.id < 30 || value.id > 41) && value.id !== 57) && (value.id < 57 && value.id > 61)) { return; }
          projectMetricsTasks.push(metricsLib(value.id, {
            project: plainProject,
            sprint,
            executeDate
          }));
        });
      });
    }
  });

  return await Promise.all(projectMetricsTasks);
}


async function saveMetrics (metricsData) {
  return await sequelize.transaction(function (t) {
    return Metrics.bulkCreate(metricsData.filter(md => md), { transaction: t });
  });
}
