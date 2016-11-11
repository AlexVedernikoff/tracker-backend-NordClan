'use strict';

const md5 = require('md5');
const sequelize = require('../orm');
const Sequelize = require('sequelize');

const HttpError = require('./HttpError');

const User = require('./User');
const Task = require('./Task');

const CommentModel = sequelize.define('comments', {
    message: { type: Sequelize.STRING, allowNull: false },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    }
  });

CommentModel.belongsTo(User.model, { foreignKey: 'user_id' });
CommentModel.belongsTo(Task.model, { foreignKey: 'task_id' });

class Comment {
  constructor() {}

  static get model() {
    return CommentModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.findOne({ where: params, include: populate });

    return find.then(comments => comments ? (new Comment()).setData(comments.toJSON(), true) : comments);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = CommentModel.findAll({ where: params, include: populate });

    return find.then(comments => comments ? comments.map(t => (new Comment()).setData(c.toJSON(), true)) : comments);
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
    let comment = CommentModel.build(this);
    if (this.id) comment.isNewRecord = false;
    comment.save()
      .then(function() {
        Comment.find({ id: comment.id });
        console.log('Comment was succesfully saved!');
      })
      .catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }

  remove() {
    let comment = CommentModel.build(this);
    if (this.id) comment.isNewRecord = false;
    comment.destroy()
      .then(function() {
        console.log('Comment was deleted!');
      });
  }
}

module.exports = Comment;
