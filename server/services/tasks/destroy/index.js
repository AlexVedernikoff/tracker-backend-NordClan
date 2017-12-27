const models = require('../../../models');
const { Task } = models;

exports.destroy = async function (taskId, userId) {
  const task = await Task.findByPrimary(taskId, { attributes: ['id'] });

  if (!task) {
    throw new Error('Task not found');
  }

  return task.destroy({ historyAuthorId: userId });
};

