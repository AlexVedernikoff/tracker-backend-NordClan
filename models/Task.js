'use strict';

const md5 = require('md5');

const HttpError = require('./HttpError');
const sequelize = require('../orm');
const Sequelize = require('sequelize');
const TaskStatusModel = require('./pgTaskStatus');
const TaskPriorityModel = require('./pgTaskPriority');
const TaskTypeModel = require('./pgTaskType');
const User = require('./User');
const Project = require('./Project');

const TaskModel = sequelize.define('tasks', {
    name: { type: Sequelize.STRING, allowNull: false },
    planned_time: Sequelize.DATE,
    fact_time: Sequelize.DATE,
    ps_id: Sequelize.INTEGER
  });

TaskModel.belongsTo(TaskStatusModel, { foreignKey: 'status_id' });
TaskModel.belongsTo(TaskPriorityModel, { foreignKey: 'priority_id' });
TaskModel.belongsTo(TaskTypeModel, { foreignKey: 'type_id' });
TaskModel.belongsTo(User.model, { foreignKey: 'owner_id' });
TaskModel.belongsTo(User.model, { foreignKey: 'author_id' });
TaskModel.belongsTo(Project.model, { foreignKey: 'project_id' });

class Task {
  constructor() {}

  static get model() {
    return TaskModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.findOne({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, doc) => err ? reject(err) : resolve(doc)))
      .then(task => task ? (new Task()).setData(task, true) : task);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.findAll({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, docs) => err ? reject(err) : resolve(docs)))
      .then(tasks => tasks ? tasks.map(t => (new Task()).setData(t, true)) : tasks);
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
    let task = new TaskModel(this);
    if (this.id) task.isNew = false;
    return new Promise((resolve, reject) =>
      task.save((err, doc) => err ? reject(err) : resolve(Task.find({ id: task.id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }
}

module.exports = Task;
