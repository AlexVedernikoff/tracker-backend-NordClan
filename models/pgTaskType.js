const sequelize = require('../orm');
const Sequelize = require('sequelize');

const TaskTypeModel = sequelize.define('task_types', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = TaskTypeModel;
