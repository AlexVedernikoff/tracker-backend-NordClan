'use strict';

const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskStatusModel = sequelize.define('task_statuses', {
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

module.exports = TaskStatusModel;
