'use strict';

const md5 = require('md5');
const sequelize = require('../orm');
const Sequelize = require('sequelize');

const HttpError = require('./HttpError');

const UserModel = sequelize.define('users', {
    username: { type: Sequelize.STRING, allowNull: false },
    firstname_ru: { type: Sequelize.STRING, allowNull: false },
    lastname_ru: { type: Sequelize.STRING, allowNull: false },
    firstname_en: Sequelize.STRING,
    lastname_en: Sequelize.STRING,
    start_date: Sequelize.DATE,
    email: Sequelize.STRING,
    mobile: Sequelize.STRING,
    skype: Sequelize.STRING,
    photo: Sequelize.STRING,
    birthday: Sequelize.STRING,
    ps_id: Sequelize.INTEGER
  });

class User {
  constructor() {}

  static get model() {
    return UserModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.findOne({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, doc) => err ? reject(err) : resolve(doc)))
      .then(user => user ? (new User()).setData(user, true) : user);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.findAll({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, docs) => err ? reject(err) : resolve(docs)))
      .then(users => users ? users.map(u => (new User()).setData(u, true)) : []);
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
    let user = new UserModel(this);
    if (this.id) task.isNewRecord = false;
    return new Promise((resolve, reject) =>
      user.save((err, doc) => err ? reject(err) : resolve(User.find({ id: user.id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }
}

module.exports = User;
