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
    // TODO: send email about error, task ST-6631
    process.exit(-1);
  }
};

async function init () {
  return await sequelize.authenticate();
}

async function getMetrics (projectId, taskTypeBug, taskStatusDone, metricTypes) {

  //console.time('query metric');
  const projectMetricsTasks = [];
  //console.time('main query');
  const project = await utils.getProject(projectId);
  //console.timeEnd('main query');

  if (!project) {
    return;
  }

  project.timeByBugs = await utils.getBugs(projectId, taskTypeBug, taskStatusDone);
  project.tasksInBacklog = await utils.getTasksInBacklog(projectId);
  project.otherTimeSheets = await utils.getOtherTimeSheets(projectId);
  project.projectUsers = await utils.getProjectUsers(projectId);
  //console.timeEnd('query metric');


  //console.time('metricsLib metric');
  if (project.sprints.length > 0) {
    project.sprints.forEach(function (sprint, sprintKey) {
      project.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
      project.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
      project.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
    });
  }

  metricTypes.forEach(function (value) {
    if (value.id > 29 && value.id !== 57) { return; }
    projectMetricsTasks.push(metricsLib(value.id, {
      project: project,
      executeDate
    }));
  });

  if (project.sprints.length > 0) {
    project.sprints.forEach(function (sprint) {
      metricTypes.forEach(function (value) {
        if (((value.id < 30 || value.id > 41) && value.id !== 57) && (value.id < 57 && value.id > 61)) { return; }
        projectMetricsTasks.push(metricsLib(value.id, {
          project: project,
          sprint,
          executeDate
        }));
      });
    });
  }

  const result = await Promise.all(projectMetricsTasks);
  //console.timeEnd('metricsLib metric');

  return result;
}


async function saveMetrics (metricsData) {
  return await sequelize.transaction(function (t) {
    return Metrics.bulkCreate(metricsData.filter(md => md), {
      transaction: t,
      logging: false
    });
  }, {
    logging: false
  });
}
