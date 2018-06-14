const taskRequests = require('./request');
const createError = require('http-errors');
const models = require('../../../models');
const { getTaskFactTimeByQa } = require('../../../services/timesheets/spent');
const { Sprint, Project } = models;


exports.read = async (id, user) => {
  const task = await taskRequests.findByPrimary(id, user.dataValues.globalRole);

  if (!task) {
    throw createError(404, 'Task not found');
  }

  if (!user.canReadProject(task.projectId)) {
    throw createError(403, 'Access denied');
  }

  if (task.tags) {
    task.tags = Object.keys(task.tags).map((k) => task.tags[k].name);
  }

  let qaPercent;

  if (task.sprintId) {
    const sprint = await Sprint.findByPrimary(task.sprintId, {attributes: ['qaPercent']});
    qaPercent = sprint.qaPercent;
  }

  if (!qaPercent) {
    const project = await Project.findByPrimary(task.projectId, { attributes: ['qaPercent'] });
    qaPercent = project ? project.qaPercent : null;
  }

  if (qaPercent && task.plannedExecutionTime) {
    task.dataValues.qaPlannedTime = qaPercent * task.plannedExecutionTime * 0.01;
  } else {
    throw createError(500, 'QA planned time calculate error');
  }

  task.dataValues.qaFactExecutionTime = await getTaskFactTimeByQa(task.id);

  return task;
};
