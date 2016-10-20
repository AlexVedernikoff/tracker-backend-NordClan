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
  constructor(application) {
    let name = 'User';

    return this;
  }

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
    return new Promise((resolve, reject) =>
      user.save((err, doc) => err ? reject(err) : resolve(User.find({ _id: user._id })))
    );
  }
}

module.exports = User;
