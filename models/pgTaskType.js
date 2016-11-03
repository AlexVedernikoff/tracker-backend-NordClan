const sequelize = require('../orm');
const Sequelize = require('sequelize');


const TaskType = sequelize.define('task_types', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskType;
