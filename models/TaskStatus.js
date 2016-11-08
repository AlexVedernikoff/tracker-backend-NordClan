'use strict';

const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskStatusModel = sequelize.define('task_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

TaskStatusModel.hasMany(Task.model, { foreignKey: 'status_id' });

module.exports = TaskStatusModel;
