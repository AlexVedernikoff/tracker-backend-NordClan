const taskRequests = require('./request');
const createError = require('http-errors');

exports.read = async (id, user) => {
  const task = await taskRequests.findByPrimary(id);

  if (!task) {
    throw createError(404, 'Task not found');
  }

  if (!user.canReadProject(task.projectId)) {
    throw createError(403, 'Access denied');
  }

  if (task.tags) {
    task.tags = Object.keys(task.tags).map((k) => task.tags[k].name);
  }

  return task;
};
