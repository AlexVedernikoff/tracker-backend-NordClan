const moment = require('moment');
const { Project, Sprint, Task, Timesheet, TaskHistory, TaskStatusesDictionary, Metrics, sequelize, TaskTypesDictionary, TaskTasks } = require('../../../models');
const metricsLib = require('./metricsLib');
const utils = require('../utils');

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
      id: projectId
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
  };

  const projects = await Project.findAll(projectsQuery);
  const [taskTypeBug, taskStatusDone, metricTypes] = await utils.getDictionaries();
  const bugs = await utils.getBugs(projectId, taskTypeBug, taskStatusDone);
  const tasksInBacklog = await utils.getTasksInBacklog(projectId);
  const otherTimeSheets = await utils.getOtherTimeSheets(projectId);
  const projectUsers = await utils.getProjectUsers(projectId);

  const projectMetricsTasks = [];
  projects.forEach(function (project) {
    const plainProject = project.get({ 'plain': true });
    plainProject.tasksInBacklog = tasksInBacklog;
    plainProject.bugs = bugs;
    plainProject.otherTimeSheets = otherTimeSheets;
    plainProject.projectUsers = projectUsers;
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
    return Metrics.bulkCreate(metricsData.filter(md => md), {
      transaction: t,
      logging: false
    });
  });
}
