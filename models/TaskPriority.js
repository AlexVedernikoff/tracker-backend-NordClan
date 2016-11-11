const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskPriorityModel = sequelize.define('task_priorities', {
    name: { type: Sequelize.STRING, allowNull: false },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    }
  }, {
    timestapms: false
  });

module.exports = TaskPriorityModel;
