const { update, getActiveTasks, getLastActiveTask } = require('./update');
const { read } = require('./read');

module.exports = {
  update,
  read,
  getActiveTasks,
  getLastActiveTask
};
