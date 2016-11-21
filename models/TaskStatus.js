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
    },
    is_open: { type: Sequelize.BOOLEAN, allowNull: false },
    ps_name: { type: Sequelize.STRING, allowNull: false },
  }, {
    timestapms: false
  });

class TaskStatus {
  constructor() {}

  static get model() {
    return TaskStatusModel;
  }

  static find(params) {
    let find = TaskStatusModel.findOne({ where: params });

    return find.then(taskStatus => taskStatus ? (new TaskStatus())
    .setData(taskStatus.toJSON(), true) : taskStatus);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this.id = data.id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }
}

module.exports = TaskStatus;
