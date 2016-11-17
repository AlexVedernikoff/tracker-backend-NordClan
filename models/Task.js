'use strict';

const md5 = require('md5');

const HttpError = require('./HttpError');
const Sequelize = require('sequelize');
const sequelize = require('../orm');
const User = require('./User');
const Project = require('./Project');

const TaskPriority = require('./TaskPriority');
const TaskStatus = require('./TaskStatus');
const TaskType = require('./TaskType');

const TaskModel = sequelize.define('tasks', {
    name: { type: Sequelize.STRING, allowNull: false },
    planned_time: Sequelize.INTEGER,
    fact_time: Sequelize.INTEGER,
    ps_id: Sequelize.STRING,
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    }
  });

TaskModel.belongsTo(Project.model, { foreignKey: 'project_id' });
TaskModel.belongsTo(User.model, { as: 'owner', foreignKey: 'owner_id' });
TaskModel.belongsTo(User.model, { as: 'author', foreignKey: 'author_id' });

TaskModel.belongsTo(TaskPriority.model, { foreignKey: 'priority_id' });
TaskModel.belongsTo(TaskStatus.model, { foreignKey: 'status_id' });
TaskModel.belongsTo(TaskType.model, { foreignKey: 'type_id' });

class Task {
  constructor() {}

  static get model() {
    return TaskModel;
  }

  static find(params) {
    let eagerLoad = [];
    let populate = params.populate;
    delete params.populate;

    populate = populate ? populate.split(',') : [];
    if (populate.indexOf('owner') !== -1) {
      eagerLoad.push({ model: User.model, as: 'owner' });
    }
    if (populate.indexOf('author') !== -1) {
      eagerLoad.push({ model: User.model, as: 'author' });
    }
    if (populate.indexOf('project') !== -1) {
      eagerLoad.push({ model: Project.model });
    }
    if (populate.indexOf('taskPriority') !== -1) {
      eagerLoad.push({ model: TaskPriority.model });
    }
    if (populate.indexOf('taskStatus') !== -1) {
      eagerLoad.push({ model: TaskStatus.model });
    }
    if (populate.indexOf('taskType') !== -1) {
      eagerLoad.push({ model: TaskType.model });
    }

    let find = TaskModel.findOne({ where: params, include: eagerLoad });

    return find.then(task => task ? (new Task()).setData(task.toJSON(), true) : task);
  }

  static findAll(params) {
    let eagerLoad = [];
    let populate = params.populate;
    delete params.populate;

    populate = populate ? populate.split(',') : [];
    if (populate.indexOf('owner') !== -1) {
      eagerLoad.push({ model: User.model, as: 'owner' });
    }
    if (populate.indexOf('author') !== -1) {
      eagerLoad.push({ model: User.model, as: 'author' });
    }
    if (populate.indexOf('project') !== -1) {
      eagerLoad.push({ model: Project.model });
    }
    if (populate.indexOf('taskPriority') !== -1) {
      eagerLoad.push({ model: TaskPriority.model });
    }
    if (populate.indexOf('taskStatus') !== -1) {
      eagerLoad.push({ model: TaskStatus.model });
    }
    if (populate.indexOf('taskType') !== -1) {
      eagerLoad.push({ model: TaskType.model });
    }

    let find = TaskModel.findAll({ where: params, include: eagerLoad });

    return find.then(tasks => tasks ? tasks.map(t => (new Task()).setData(t.toJSON(), true)) : tasks);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this.id = data.id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }

  save() {
    let task = TaskModel.build(this);
    if (this.id) task.isNewRecord = false;
    return new Promise((resolve, reject) => {
      task.save()
      .then(function() {
        resolve(Task.find({ id: task.id }));
      })
      .catch(err => reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
    });
  }
}

module.exports = Task;

