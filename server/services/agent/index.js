const moment = require('moment');

const { Project, ProjectUsers, Sprint, Task, TaskStatusesDictionary, User, Metrics, MetricTypesDictionary, Sequelize, sequelize } = require('../../models');
const metricsLib = require('./metricsLib');

const executeDate = moment().toISOString();

module.exports.run = async function (){
  try {
    await init();
  } catch (err){
    console.error('Unable to connect to the database:', err);
    throw err;
  }

  console.log('Database connection has been established successfully.');

  let metricsData;

  try {
    metricsData = await getMetrics();
  } catch (err){
    console.error('getMetrics err', err);
    throw err;
  }

  try {
    await saveMetrics(metricsData);
  } catch (err){
    console.error('saveMetrics err', err);
    throw err;
  }

  process.exit(-1);
};

async function init (){
  return await sequelize.authenticate();
}

async function getMetrics (){
  const projectsQuery = {
    attributes: Project.defaultSelect,
    include: [
      {
        as: 'sprints',
        model: Sprint,
        attributes: Sprint.defaultSelect.concat([
          [
            Sequelize.literal(`(SELECT count(*)
                FROM tasks as t
                WHERE t.project_id = "Project"."id"
                AND t.sprint_id = "sprints"."id"
                AND t.deleted_at IS NULL
                AND t.type_id = '2'
                AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
            'activeBugsAmount'
          ], // Количество открытых задач Тип = Баг
          [
            Sequelize.literal(`(SELECT count(*)
                FROM tasks as t
                WHERE t.project_id = "Project"."id"
                AND t.sprint_id = "sprints"."id"
                AND t.deleted_at IS NULL
                AND t.type_id = '5'
                AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
            'clientBugsAmount'
          ], // Количество открытых задач Тип = Баг от Клиента
          [
            Sequelize.literal(`(SELECT count(*)
                FROM tasks as t
                WHERE t.project_id = "Project"."id"
                AND t.sprint_id = "sprints"."id"
                AND t.deleted_at IS NULL
                AND t.type_id = '4'
                AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
            'regressionBugsAmount'
          ] // Количество открытых задач Тип = Регрес.баг
        ]),
        include: [
          {
            as: 'tasks',
            model: Task,
            attributes: Task.defaultSelect,
            where: {
              statusId: {
                $in: TaskStatusesDictionary.DONE_STATUSES
              },
              deletedAt: {
                $eq: null
              }
            },
            required: false
          }
        ]
      },
      {
        as: 'users',
        model: User,
        attributes: User.defaultSelect,
        through: {
          as: 'projectUser',
          model: ProjectUsers
        }
      }
    ],
    subQuery: true
  };

  const projects = await Project.findAll(projectsQuery);
  const projectMetricsTasks = [];

  projects.forEach(function (project){
    const plainProject = project.get({ 'plain': true });
    if (plainProject.sprints.length > 0){
      plainProject.sprints.forEach(function (sprint, sprintKey){
        plainProject.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
        plainProject.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
        plainProject.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
      });
    }
    if (plainProject.users.length > 0){
      plainProject.users.forEach(function (user, userKey){
        if (!user.projectUser.rolesIds) return;
        plainProject.users[userKey].projectUser.rolesIds = JSON.parse(user.projectUser.rolesIds);
      });
    }
    MetricTypesDictionary.values.forEach(function (value){
      if (value.id > 29) return;
      projectMetricsTasks.push(metricsLib(value.id, {
        plainProject,
        executeDate
      }));
    });
    if (plainProject.sprints.length > 0){
      plainProject.sprints.forEach(function (sprint){
        MetricTypesDictionary.values.forEach(function (value){
          if (value.id < 30 || value.id > 40) return;
          projectMetricsTasks.push(metricsLib(value.id, {
            plainProject,
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
  return await Metrics.bulkCreate(metricsData);
}
