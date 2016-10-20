'use strict';

const md5 = require('md5');
const mongoose = require('mongoose');

const HttpError = require('./HttpError');
const User = require('./User');
const Project = require('./Project');

const TaskSchema = new mongoose.Schema({
  name: String,
  status: String,
  priority: Number,
  type: String,
  planedTime: Number,
  currentTime: Number,
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.ObjectId, ref: 'Project' },
  psId: String,
}, { versionKey: false, timestamps: true });

const TaskModel = mongoose.model('Task', TaskSchema);

class Task {
  constructor(application) {
    let name = 'Task';

    return this;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.findOne(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, doc) => err ? reject(err) : resolve(doc)))
      .then(task => task ? (new Task()).setData(task, true) : task);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = TaskModel.find(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, docs) => err ? reject(err) : resolve(docs)))
      .then(tasks => tasks ? tasks.map(t => (new Task()).setData(t, true)) : tasks);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this._id = data._id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }

  save() {
    let task = new TaskModel(this);
    return new Promise((resolve, reject) =>
      task.save((err, doc) => err ? reject(err) : resolve(Task.find({ _id: task._id })))
    );
  }
}

module.exports = Task;
