'use strict';

const md5 = require('md5');
const sequelize = require('../orm');
const Sequelize = require('sequelize');

const HttpError = require('./HttpError');
const Task = require('./Task');
const User = require('./User');

const CommentModel = sequelize.define('comments', {
    message: { type: Sequelize.STRING, allowNull: false }
  });

CommentModel.belongsTo(User.model, { foreignKey: 'user_id' });
CommentModel.belongsTo(Task.model, { foreignKey: 'task_id' });

class Comment {
  constructor() {}

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.findOne({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, doc) => err ? reject(err) : resolve(doc)))
      .then(task => task ? (new Comment()).setData(task, true) : task);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.findAll({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec((err, docs) => err ? reject(err) : resolve(docs)))
      .then(tasks => tasks ? tasks.map(t => (new Comment()).setData(t, true)) : tasks);
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
    let task = new CommentModel(this);
    if (this.id) task.isNewRecord = false;
    return new Promise((resolve, reject) =>
      task.save((err, doc) => err ? reject(err) : resolve(Comment.find({ id: task.id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }

  remove() {
    let task = new CommentModel(this);
    if (this.id) task.isNewRecord = false;
    return new Promise((resolve, reject) =>
      task.remove((err, doc) => err ? reject(err) : resolve())
    );
  }
}

module.exports = Comment;
