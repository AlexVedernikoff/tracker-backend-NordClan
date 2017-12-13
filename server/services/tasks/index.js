const { update, getActiveTasks, getLastActiveTask } = require('./update');
const { read } = require('./read');
const { create } = require('./create');
const { list } = require('./list');
const { destroy } = require('./destroy');

module.exports = {
  update,
  read,
  getActiveTasks,
  getLastActiveTask,
  create,
  list,
  destroy
};
