'use strict';

const http = require('http');
const mongoose = require('mongoose');
const oauthServer = require('oauth2-server');
const co = require('co');

const config = require('../configs');
const HttpError = require('./HttpError');
const User = require('./User');
const LDAP = require('./LDAP');
const PS = require('./PS');

const OAuthAccessTokensSchema = new mongoose.Schema({
  accessToken: { type: String },
  clientId: { type: String },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  expires: { type: Date, expires: 3600 }
}, { versionKey: false });

const OAuthRefreshTokensSchema = new mongoose.Schema({
  refreshToken: { type: String },
  clientId: { type: String },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  expires: { type: Date, expires: 3600 }
}, { versionKey: false });

const OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
const OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);

class OAuth {
  constructor(options) {
    this.options = options;

    if (options.req) {
      this.req = options.req;
      delete options.req;
    }

    this.server = oauthServer(Object.assign({
      model: this,
      grants: ['password', 'refresh_token'],
    }, config.oauth, this.options));
  }

  static *authorize(next) {
    this.request.isAuthorised = false;
    let oauth = new OAuth({ req: this.request });
    let user = yield oauth.auth();

    if (user) {
      this.request.user = user;
      this.request.isAuthorised = true;
      yield next;
    } else {
      this.throw(new HttpError(401, 'Unauthorized'));
    }
  }

  setReq(req) { this.req = req; return this; }

  login(isRefresh) {
    return new Promise((resolve, reject) => {
      this.req.headers['content-type'] = 'application/x-www-form-urlencoded';
      this.req.fields.grant_type = isRefresh ? 'refresh_token' : 'password';
      this.req.body = this.req.fields;

      this.res = {
        set: () => { },
        jsonp: (token) => {
          token.user = this.req.user;
          resolve(token);
        }
      };

      this.server.grant()(this.req, this.res, (err) => {
        if (err) { reject(err); }
      });
    });
  }

  auth() {
    return new Promise((resolve, reject) => {
      this.server.authorise()(this.req, {}, (err) => {
        let { oauth = {} } = this.req;
        let { bearerToken = {} } = oauth;
        let { user } = bearerToken;

        if (user) {
          this.req.user = new User().setData(user, true);
          return resolve(this.req.user);
        }

        reject(new HttpError(401, 'Unauthorized'));
      });
    });
  }

  logout() {
    if (this.req.oauth && this.req.oauth.bearerToken) {
      OAuthAccessTokensModel.find({ clientId: this.req.oauth.bearerToken.clientId }, (err, docs) => {
        docs.map(doc => doc.remove());
      });
      OAuthRefreshTokensModel.find({ clientId: this.req.oauth.bearerToken.clientId }, (err, docs) => {
        docs.map(doc => doc.remove());
      });
    }

    return Promise.resolve();
  }

  getAccessToken(accessToken, callback) {
    let find = OAuthAccessTokensModel.findOne({ accessToken });
    find.populate('user');
    find.exec(callback);
  }

  saveAccessToken(accessToken, clientId, expires, user, callback) {
    let data = {
      accessToken,
      clientId,
      expires,
      user: user._id,
    };

    let model = new OAuthAccessTokensModel(data);

    model.save(callback);
  }

  getClient(clientId, clientSecret, callback) {
    callback(null, { clientId, clientSecret });
  }

  grantTypeAllowed(clientId, grantType, callback) {
    if (['password', 'refresh_token'].indexOf(grantType) >= 0) {
      return callback(null, true);
    }

    callback(null, false);
  }

  getUser(username, password, callback) {
    let ldap = new LDAP({ req: this.req });
    co(function *() {
      let entry = yield ldap.login();
      let user = yield User.find({ username });

      if (user) {
        callback(null, user);
        return;
      }

      let psUser = yield* PS.getUser(username);

      user = new User();
      user.setData({
        username,
        firstnameRu: psUser.firstNameRu,
        lastnameRu: psUser.lastNameRu,
        firstnameEn: psUser.firstNameEn,
        lastnameEn: psUser.lastNameEn,
        email: psUser.emailPrimary,
        mobile: psUser.mobile,
        skype: psUser.skype,
        photo: psUser.photo,
        birthday: psUser.birthDate,
        psId: psUser.id,
      });

      user = yield user.save();
      callback(null, user);
    });
  }

  saveRefreshToken(refreshToken, clientId, expires, user, callback) {
    let data = {
      refreshToken,
      clientId,
      expires,
      user: user._id,
    };

    let model = new OAuthRefreshTokensModel(data);

    model.save(callback);
  }

  getRefreshToken(refreshToken, callback) {
    let find = OAuthRefreshTokensModel.findOne({ refreshToken });
    find.populate('user');
    find.exec((err, doc) => {
      console.log(err, doc);
      callback(err, doc);
    });
  }
}

module.exports = OAuth;
