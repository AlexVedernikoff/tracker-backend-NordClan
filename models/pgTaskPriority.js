const sequelize = require('../orm');
const Sequelize = require('sequelize');

const TaskPriorityModel = sequelize.define('task_priorities', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskPriorityModel;
