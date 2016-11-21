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

class TaskPriority {
  constructor() {}

  static get model() {
    return TaskPriorityModel;
  }

  static find(params) {
    let find = TaskPriorityModel.findOne({ where: params });

    return find.then(taskPriority => taskPriority ? (new TaskPriority())
    .setData(taskPriority.toJSON(), true) : taskPriority);
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

module.exports = TaskPriority;
