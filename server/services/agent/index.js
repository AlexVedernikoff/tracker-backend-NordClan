const moment = require('moment');

const { Project, ProjectUsers, Sprint, Task, TaskStatusesDictionary, User, Metrics, Sequelize, sequelize } = require('../../models');
const metricsLib = require('./metricsLib');

const executeDate = moment().toISOString();

module.exports.run = async function(){
  try{
    await init();
  }catch (err){
    console.error('Unable to connect to the database:', err);
    process.exit(-1);
  }

  console.log('Database connection has been established successfully.');

  let metricsData;
  
  try{
    metricsData = await getMetrics();
  }catch (err){
    console.error('getMetrics err', err);
    process.exit(-1);
  }

  try{
    await saveMetrics(metricsData);
  }catch (err){
    console.error('saveMetrics err', err);
    process.exit(-1);
  }

  console.log('ok');
  process.exit(-1);
}

async function init(){
  return await sequelize.authenticate();
}

async function getMetrics(){
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
          include : [
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

  let projects = await Project.findAll(projectsQuery);
  let projectMetricsTasks = [];

  projects.forEach(function(project){
    project = project.get({ 'plain' : true });
    if(project.sprints.length > 0){
      project.sprints.forEach(function(sprint, sprintKey){
        project.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
        project.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
        project.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
      })
    }
    if(project.users.length > 0){
      project.users.forEach(function(user, userKey){
        if(!user.projectUser.rolesIds) return;
        project.users[userKey].projectUser.rolesIds = JSON.parse(user.projectUser.rolesIds);
      })
    }
    for(let i=1; i<=9; i++){
      projectMetricsTasks.push(metricsLib(i, {
        project,
        executeDate
      }))
    }
    for(let i=10; i<=29; i++){
      projectMetricsTasks.push(metricsLib(i, {
        project,
        executeDate
      }))
    }
    if(project.sprints.length > 0){
      project.sprints.forEach(function(sprint){
        for(let i=30; i<=40; i++){
          projectMetricsTasks.push(metricsLib(i, {
            project,
            sprint,
            executeDate
          }))
        }
      })
    }
  })

  return await Promise.all(projectMetricsTasks);
}


async function saveMetrics(metricsData){
  return await Metrics.bulkCreate(metricsData);
}