const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskPriorityModel = sequelize.define('task_priorities', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

TaskPriorityModel.hasMany(Task.model, { foreignKey: 'priority_id' });

module.exports = TaskPriorityModel;
