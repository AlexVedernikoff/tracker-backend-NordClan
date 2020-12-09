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
      const calculatedDate = moment();

      console.time('main query');
      const project = await utils.getProject(projectsIs[index]);
      console.timeEnd('main query');

      if (project) {
        const metricsData = await getMetrics(project, taskTypeBug, taskStatusDone, metricTypes);
        metricsData && await saveMetrics(metricsData);
        await utils.updateSprintMetricLastUpdate(project.sprints.map(sprint => sprint.id), calculatedDate);
      }

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

async function getMetrics (project, taskTypeBug, taskStatusDone, metricTypes) {
  const projectMetricsTasks = [];

  console.time('subquery metric');
  await Promise.all([
    utils.getBugs(project.id, taskTypeBug, taskStatusDone)
      .then(data => {project.timeByBugs = data;}),
    utils.getTasksInBacklog(project.id)
      .then(data => {project.tasksInBacklog = data;}),
    utils.getOtherTimeSheets(project.id)
      .then(data => {project.otherTimeSheets = data;}),
    utils.getProjectUsers(project.id)
      .then(data => {project.projectUsers = data;}),
    utils.spentTimeAllProject(project.id)
      .then(data => {project.spentTimeAllProject = data;}),
    utils.bugsCount(project.id)
      .then(data => {project.bugsCount = data;}),
    utils.bugsCountFromClient(project.id)
      .then(data => {project.bugsCountFromClient = data;}),
    utils.bugsCountRegression(project.id)
      .then(data => {project.bugsCountRegression = data;}),
    utils.spentTimeByRoles(project.id)
      .then(data => {project.spentTimeByRoles = data;}),
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
        executeDate,
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
            executeDate,
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
  let transaction;
  try {
    transaction = await sequelize.transaction();
    await Metrics.bulkCreate(metricsData.filter(md => md), {
      transaction,
      logging: false,
    });
    await transaction.commit();
  } catch (e) {
    if (transaction) {
      await transaction.rollback();
    }
    throw e;
  }
}
