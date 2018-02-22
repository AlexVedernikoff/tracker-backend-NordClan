const moment = require('moment');
const { Project, ProjectUsers, ProjectUsersRoles, Sprint, Task, Timesheet, TaskHistory, TaskStatusesDictionary,
  User, Metrics, MetricTypesDictionary, Sequelize, sequelize } = require('../../../models');
const metricsLib = require('./metricsLib');

const executeDate = moment().toISOString();

module.exports.calculate = async function (projectId){
  try {
    await init();
  } catch (err){
    console.error('Unable to connect to the database:', err);
    process.exit(-1);
  }

  console.log('Database connection has been established successfully.');

  let metricsData;

  try {
    metricsData = await getMetrics(projectId);
  } catch (err){
    console.error('getMetrics err', err);
    process.exit(-1);
  }

  try {
    await saveMetrics(metricsData);
  } catch (err){
    console.error('saveMetrics err', err);
    process.exit(-1);
  }

  process.exit(0);
};

async function init (){
  return await sequelize.authenticate();
}

async function getMetrics (projectId){
  const projectsQuery = {
    where: {
      ...(projectId ? {
        id: {$eq: projectId}
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
                attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable'],
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

  const tasksInBacklog = await Task.findAll({
    where: {
      sprintId: null
    },
    attributes: ['id', 'sprintId', 'projectId'],
    include: [
      {
        as: 'timesheets',
        model: Timesheet,
        attributes: ['id', 'sprintId', 'spentTime', 'projectId', 'userRoleId', 'isBillable'],
        required: false
      }
    ]
  }).then(tasks => tasks
    .map(task => task.get({ 'plain': true }))
    .filter(task => task.timesheets.length > 0));

  const projectMetricsTasks = [];

  projects.forEach(function (project){
    const plainProject = project.get({ 'plain': true });
    plainProject.tasksInBacklog = tasksInBacklog.filter(task => task.projectId === plainProject.id);
    if (plainProject.sprints.length > 0){
      plainProject.sprints.forEach(function (sprint, sprintKey){
        plainProject.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
        plainProject.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
        plainProject.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
      });
    }
    MetricTypesDictionary.values.forEach(function (value){
      if (value.id > 29) return;
      projectMetricsTasks.push(metricsLib(value.id, {
        project: plainProject,
        executeDate
      }));
    });
    if (plainProject.sprints.length > 0){
      plainProject.sprints.forEach(function (sprint){
        MetricTypesDictionary.values.forEach(function (value){
          if (value.id < 30 || value.id > 41) return;
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


async function saveMetrics (metricsData){
  return await sequelize.transaction(function (t){
    return Metrics.bulkCreate(metricsData, {transaction: t});
  });
}
