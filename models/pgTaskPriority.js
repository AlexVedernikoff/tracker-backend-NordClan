const sequelize = require('../orm');
const Sequelize = require('sequelize');

const TaskPriority = sequelize.define('task_priorities', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskPriority;
