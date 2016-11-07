const sequelize = require('../orm');
const Sequelize = require('sequelize');

const TaskStatusModel = sequelize.define('task_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskStatusModel;
