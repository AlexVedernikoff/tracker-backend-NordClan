'use strict';

const md5 = require('md5');

const HttpError = require('./HttpError');
const Sequelize = require('sequelize');
const sequelize = require('../orm');
const User = require('./User');
const Project = require('./Project');

const TaskPriorityModel = require('./TaskPriority');
const TaskStatusModel = require('./TaskStatus');
const TaskTypeModel = require('./TaskType');

const TaskModel = sequelize.define('tasks', {
    name: { type: Sequelize.STRING, allowNull: false },
    planned_time: Sequelize.DATE,
    fact_time: Sequelize.DATE,
    ps_id: Sequelize.INTEGER,
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

TaskModel.belongsTo(TaskPriorityModel, { foreignKey: 'priority_id' });
TaskModel.belongsTo(TaskStatusModel, { foreignKey: 'status_id' });
TaskModel.belongsTo(TaskTypeModel, { foreignKey: 'type_id' });


class Task {
  constructor() {}

  static get model() {
    return TaskModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.findOne({ where: params, include: [{ model: User.model, as: 'owner' },
     { model: User.model, as: 'author' }, { model: Project.model }, { model: TaskPriorityModel },
      { model: TaskStatusModel }, { model: TaskTypeModel }]});

    return find.then(task => task ? (new Task()).setData(task.toJSON(), true) : task);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.findAll({ where: params, include: [{ model: User.model, as: 'owner' },
     { model: User.model, as: 'author' }, { model: Project.model }] });

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
    task.save()
      .then(function() {
        Task.find({ id: task.id });
        console.log('Task was succesfully saved!');
      })
      .catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }
}

module.exports = Task;

