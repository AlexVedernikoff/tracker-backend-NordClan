const moment = require('moment');
const { Metrics, sequelize } = require('../../../models');
const metricsLib = require('./metricsLib');
const utils = require('../utils');

const executeDate = moment().toISOString();

module.exports.calculate = async function (projectId) {
  try {
    await init();
    console.time('calculate all metric');
    const [taskTypeBug, taskStatusDone, metricTypes] = await utils.getDictionaries();
    const projectsIs = await utils.getProjectIds(projectId);

    for (let index = 0; index < projectsIs.length; index++) {
      const metricsData = await getMetrics(projectsIs[index], taskTypeBug, taskStatusDone, metricTypes);
      //console.time('save metric');
      metricsData && await saveMetrics(metricsData);
      //console.timeEnd('save metric');
      console.log(`done projectId: ${projectsIs[index]} (${index + 1}/${projectsIs.length})`);
    }

    console.timeEnd('calculate all metric');
    process.exit(0);

  } catch (err) {
    console.error('Error. Can not calculate metrics. Reason: ', err);
    console.error(err);
    // TODO: send email about error, task ST-6631
    process.exit(-1);
  }
};

async function init () {
  return await sequelize.authenticate();
}

async function getMetrics (projectId, taskTypeBug, taskStatusDone, metricTypes) {


  const projectMetricsTasks = [];
  console.time('main query');
  const project = await utils.getProject(projectId);
  console.timeEnd('main query');

  if (!project) {
    return;
  }
  console.time('subquery metric');
  await Promise.all([
    utils.getBugs(projectId, taskTypeBug, taskStatusDone)
      .then(data => {project.timeByBugs = data;}),
    utils.getTasksInBacklog(projectId)
      .then(data => {project.tasksInBacklog = data;}),
    utils.getOtherTimeSheets(projectId)
      .then(data => {project.otherTimeSheets = data;}),
    utils.getProjectUsers(projectId)
      .then(data => {project.projectUsers = data;}),
    utils.spentTimeAllProject(projectId)
      .then(data => {project.spentTimeAllProject = data;}),
    utils.bugsCount(projectId)
      .then(data => {project.bugsCount = data;}),
    utils.bugsCountFromClient(projectId)
      .then(data => {project.bugsCountFromClient = data;}),
    utils.bugsCountRegression(projectId)
      .then(data => {project.bugsCountRegression = data;}),
    utils.spentTimeByRoles(projectId)
      .then(data => {project.spentTimeByRoles = data;})
  ]);
  console.timeEnd('subquery metric');

  //console.time('metricsLib metric');
  if (project.sprints.length > 0) {
    project.sprints.forEach(function (sprint, sprintKey) {
      project.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
      project.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
      project.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
    });
  }

  metricTypes.forEach(function (value) {
    if (!value.calcEverySprint) {
      //console.log('I value.id = ', value.id);
      projectMetricsTasks.push(metricsLib(value.id, {
        project: project,
        executeDate
      }));
    }
  });

  if (project.sprints.length > 0) {
    project.sprints.forEach(function (sprint) {
      metricTypes.forEach(function (value) {
        if (value.calcEverySprint) {
          //console.log('II value.id = ', value.id);
          projectMetricsTasks.push(metricsLib(value.id, {
            project: project,
            sprint,
            executeDate
          }));
        }
      });
    });
  }

  const result = await Promise.all(projectMetricsTasks);
  //console.timeEnd('metricsLib metric');

  return result;
}


async function saveMetrics (metricsData) {
  return await sequelize.transaction({
    logging: false
  }, function (t) {
    return Metrics.bulkCreate(metricsData.filter(md => md), {
      transaction: t,
      logging: false
    });
  });
}
