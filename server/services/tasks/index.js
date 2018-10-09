const { update, getActiveTasks, getLastActiveTask, updateAllByAttribute } = require('./update');
const { read } = require('./read');
const { create } = require('./create');
const { list } = require('./list');
const { destroy } = require('./destroy');

module.exports = {
  update,
  updateAllByAttribute,
  read,
  getActiveTasks,
  getLastActiveTask,
  create,
  list,
  destroy
};
