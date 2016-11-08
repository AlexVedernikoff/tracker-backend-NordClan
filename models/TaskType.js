const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskTypeModel = sequelize.define('task_types', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

TaskTypeModel.hasMany(Task.model, { foreignKey: 'type_id' });

module.exports = TaskTypeModel;
