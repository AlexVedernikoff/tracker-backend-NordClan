'use strict';

const http = require('http');
const oauthServer = require('oauth2-server');
const co = require('co');

const config = require('../configs');
const HttpError = require('./HttpError');
const User = require('./User');
const LDAP = require('./LDAP');
const PS = require('./PS');

const Sequelize = require('sequelize');
const sequelize = require('../orm');

const OAuthAccessTokensModel = sequelize.define('oauth_access_tokens', {
    accessToken: {
      field: 'access_token',
      type: Sequelize.STRING
    },
    clientId: {
      field: 'client_id',
      type: Sequelize.STRING
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    },
    expires: { type: Sequelize.DATE, defaultValue: function() {
        let date = new Date();
        return date.setDate(date.getDate() + 1);
      }
    }
  }, {
    timestapms: false,
    scopes: {
      deletedTokens: function() {
        return {
          where: {
            expires: {
              $lt: new Date()
            }
          }
        };
      }
    },
    hooks: {
      beforeCreate: function() {
        let tokens = OAuthAccessTokensModel.scope('deletedTokens');
        tokens.destroy({ where: { expires: { $lt: new Date() } } });
      }
    }
  });

const OAuthRefreshTokensModel = sequelize.define('oauth_refresh_tokens', {
    refreshToken:  {
      field: 'refresh_token',
      type: Sequelize.STRING
    },
    clientId:  {
      field: 'client_id',
      type: Sequelize.STRING
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    },
    expires: { type: Sequelize.DATE, defaultValue: function() {
        let date = new Date();
        return date.setDate(date.getDate() + 7);
      }
    }
  }, {
    timestapms: false,
    scopes: {
      deletedTokens: function() {
        return {
          where: {
            expires: {
              $lt: new Date()
            }
          }
        };
      }
    },
    hooks: {
      beforeCreate: function() {
        let tokens = OAuthRefreshTokensModel.scope('deletedTokens');
        tokens.destroy({ where: { expires: { $lt: new Date() } } });
      }
    }
  });

OAuthAccessTokensModel.belongsTo(User.model, { foreignKey: 'user_id' });
OAuthRefreshTokensModel.belongsTo(User.model, { foreignKey: 'user_id' });

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
          this.req.user = new User().setData(user.toJSON(), true);
          return resolve(this.req.user);
        }

        reject(new HttpError(401, 'Unauthorized'));
      });
    });
  }

  /* пока не создан роут на логаут, если будет бросать еррор сделать через скоуп в моделе oauth */
  logout() {
    if (this.req.oauth && this.req.oauth.bearerToken) {
      OAuthAccessTokensModel.findById({ clientId: this.req.oauth.bearerToken.clientId })
        .then(function(token) {
          token.destroy();
        });
      OAuthRefreshTokensModel.findById({ clientId: this.req.oauth.bearerToken.clientId })
        .then(function(token) {
          token.destroy();
        });
    }

  }

  getAccessToken(accessToken, callback) {
    let find = OAuthAccessTokensModel.findOne({ where: { accessToken: accessToken }, include: User.model });
    find.then(token => callback(null, token));
  }

  saveAccessToken(accessToken, clientId, expires, user, callback) {
    let data = {
      accessToken: accessToken,
      clientId: clientId,
      expires: expires,
      user_id: user.id,
    };

    OAuthAccessTokensModel.create(data)
      .then(token => callback(null, token));
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
        firstname_ru: psUser.firstNameRu,
        lastname_ru: psUser.lastNameRu,
        firstname_en: psUser.firstNameEn,
        lastname_en: psUser.lastNameEn,
        email: psUser.emailPrimary,
        mobile: psUser.mobile,
        skype: psUser.skype,
        photo: psUser.photo,
        birthday: psUser.birthDate,
        ps_id: psUser.id,
      });

      user = yield user.save();
      callback(null, user);
    }).catch(err => callback(err));
  }

  saveRefreshToken(refreshToken, clientId, expires, user, callback) {
    let data = {
      refreshToken: refreshToken,
      clientId: clientId,
      expires: expires,
      user_id: user.id,
    };

    OAuthRefreshTokensModel.create(data)
     .then(token => callback(null, token));

  }

  getRefreshToken(refreshToken, callback) {
    let find = OAuthRefreshTokensModel.findOne({ where: { refreshToken: refreshToken }, include: User.model });
    find.then(token => callback(null, token));
  }
}

module.exports = OAuth;
