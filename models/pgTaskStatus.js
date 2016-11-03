const sequelize = require('../orm');
const Sequelize = require('sequelize');

const TaskStatus = sequelize.define('task_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskStatus;
