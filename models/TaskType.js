const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');

const TaskTypeModel = sequelize.define('task_types', {
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

module.exports = TaskTypeModel;
