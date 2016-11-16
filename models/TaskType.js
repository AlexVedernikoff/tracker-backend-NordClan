const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Task = require('./Task');
const HttpError = require('./HttpError');

const TaskTypeModel = sequelize.define('task_types', {
    name: { type: Sequelize.STRING, allowNull: false },
    ps_id: { type: Sequelize.STRING, allowNull: false },
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

class TaskType {
  constructor() {}

  static get model() {
    return TaskTypeModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskTypeModel.findOne({ where: params });

    return find.then(taskType => taskType ? (new Project()).setData(taskType.toJSON(), true) : taskType);
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
    let taskType = TaskTypeModel.build(this);
    if (this.id) taskType.isNewRecord = false;
    return new Promise((resolve, reject) => {
      taskType.save()
      .then(function() {
        resolve(TaskType.find({ id: taskType.id }));
      })
      .catch(err => reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
    });

  }
}

module.exports = TaskType;
