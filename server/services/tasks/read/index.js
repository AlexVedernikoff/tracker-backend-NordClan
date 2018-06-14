const taskRequests = require('./request');
const createError = require('http-errors');
const {getQaTimeByTask} = require('../utils');

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

  const {qaFactExecutionTime, qaPlannedTime} = await getQaTimeByTask(task);

  if (!(qaPlannedTime && qaFactExecutionTime)) {
    throw createError(500, 'QA planned time calculate error');
  }

  task.dataValues.qaPlannedTime = qaPlannedTime;
  task.dataValues.qaFactExecutionTime = qaFactExecutionTime;

  return task;
};
