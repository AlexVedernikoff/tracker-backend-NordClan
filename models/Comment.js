'use strict';

const md5 = require('md5');
const mongoose = require('mongoose');

const HttpError = require('./HttpError');
const Task = require('./Task');
const User = require('./User');

const CommentSchema = new mongoose.Schema({
  message: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.ObjectId, ref: 'Task', required: true },
}, { versionKey: false, timestamps: true });

const CommentModel = mongoose.model('Comment', CommentSchema);

class Comment {
  constructor() {}

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.findOne(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, doc) => err ? reject(err) : resolve(doc)))
      .then(task => task ? (new Comment()).setData(task, true) : task);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.find(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, docs) => err ? reject(err) : resolve(docs)))
      .then(tasks => tasks ? tasks.map(t => (new Comment()).setData(t, true)) : tasks);
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
    let task = new CommentModel(this);
    if (this._id) task.isNew = false;
    return new Promise((resolve, reject) =>
      task.save((err, doc) => err ? reject(err) : resolve(Comment.find({ _id: task._id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }

  remove() {
    let task = new CommentModel(this);
    if (this._id) task.isNew = false;
    return new Promise((resolve, reject) =>
      task.remove((err, doc) => err ? reject(err) : resolve())
    );
  }
}

module.exports = Comment;
