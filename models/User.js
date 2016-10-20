'use strict';

const md5 = require('md5');
const mongoose = require('mongoose');

const HttpError = require('./HttpError');

const UserSchema = new mongoose.Schema({
  username: String,
  firstnameRu: String,
  lastnameRu: String,
  firstnameEn: String,
  lastnameEn: String,
  email: String,
  mobile: String,
  skype: String,
  photo: String,
  birthday: String,
  psId: String,
}, { versionKey: false, timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

class User {
  constructor() {}

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.findOne(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, doc) => err ? reject(err) : resolve(doc)))
      .then(user => user ? (new User()).setData(user, true) : user);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = UserModel.find(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, docs) => err ? reject(err) : resolve(docs)))
      .then(users => users ? users.map(u => (new User()).setData(u, true)) : []);
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
    let user = new UserModel(this);
    if (this._id) task.isNew = false;
    return new Promise((resolve, reject) =>
      user.save((err, doc) => err ? reject(err) : resolve(User.find({ _id: user._id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }
}

module.exports = User;
