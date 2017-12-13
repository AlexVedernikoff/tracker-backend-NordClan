const taskRequests = require('./request');

exports.read = async (id, user) => {
  const task = await taskRequests.findByPrimary(id);

  if (!task) {
    throw new Error('Task not found');
  }

  if (!user.canReadProject(task.projectId)) {
    throw new Error('Access denied');
  }

  if (task.tags) {
    task.tags = Object.keys(task.tags).map((k) => task.tags[k].name);
  }

  return task;
};
