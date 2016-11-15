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
    email: Sequelize.STRING,
    mobile: Sequelize.STRING,
    skype: Sequelize.STRING,
    photo: Sequelize.STRING,
    birthday: Sequelize.DATE,
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

class User {
  constructor() {}

  static get model() {
    return UserModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.findOne({ where: params, include: populate });

    return find.then(user => user ? (new User()).setData(user.toJSON(), true) : user);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.findAll({ where: params, include: populate });

    return find.then(users => users ? users.map(u => (new User()).setData(u.toJSON(), true)) : []);
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
    let user = UserModel.build(this);
    if (this.id) user.isNewRecord = false;
    return new Promise((resolve, reject) => {
      user.save()
      .then(function() {
        resolve(User.find({ id: user.id }));
      })
      .catch(err => reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
    });
  }
}

module.exports = User;
