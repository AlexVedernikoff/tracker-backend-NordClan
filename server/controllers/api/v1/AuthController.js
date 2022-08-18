const createError = require('http-errors');
const moment = require('moment');
const ldap = require('ldapjs');
const Auth = require('../../../middlewares/CheckTokenMiddleWare');
const SystemAuth = require('../../../middlewares/CheckSystemTokenMiddleWare');
const { userAuthExtension } = require('../../../middlewares/Access/userAuthExtension');
const models = require('../../../models');
const { User, Token, SystemToken } = models;
const queries = require('../../../models/queries');
const config = require('../../../configs');
const bcrypt = require('bcrypt-nodejs');

exports.login = function (req, res, next) {
  if (!req.body.login || !req.body.password) return next(createError(401, 'Login and password are required'));

  if (isSystemUser(req)) {
    return authSystemUser(req.body.login, req.body.password);
  }

  User.findOne({
    where: {
      login: req.body.login,
      active: 1,
    },
    include: [
      {
        as: 'authorsProjects',
        model: models.Project,
      },
      {
        as: 'usersProjects',
        model: models.ProjectUsers,
        include: [
          {
            as: 'roles',
            model: models.ProjectUsersRoles,
          },
        ],
      },
    ],
    attributes: [...User.defaultSelect, 'ldapLogin', 'password', 'isTest', 'createdAt'],
  })
    .then(user => {
      if (!user) return next(createError(404, 'Invalid Login or Password'));

      queries.token.deleteExpiredTokens(user);

      if (user.globalRole === 'EXTERNAL_USER' || user.isTest || user.globalRole === 'EXTERNAL_SERVICE') {
        return authExternalUser(user, req.body.password);
      } else {
        authLdap(user, req.body.password);
      }
    })
    .catch(err => {
      next(err);
    });

  function authLdap (user, password) {
    const client = ldap.createClient({
      url: config.ldapUrl,
    });

    client.bind('uid=' + user.ldapLogin + ',dc=nordclan', password, function (err) {
      console.log(err);
      if (err) {
        client.unbind();
        return next(createError(err));
      }

      const token = Auth.createJwtToken({
        login: req.body.login,
      });

      Token.create({
        userId: user.dataValues.id,
        token: token.token,
        expires: token.expires.format(),
      })
        .then(() => {
          res.cookie('authorization', 'Basic ' + token.token, {
            maxAge: config.auth.accessTokenLifetime * 1000,
            httpOnly: true,
          });
          user.dataValues.birthDate = moment(user.dataValues.birthDate).format('YYYY-DD-MM');
          delete user.dataValues.ldapLogin;

          res.json({
            token: token.token,
            expire: token.expires,
            user: userAuthExtension(user),
          });
        })
        .catch(e => next(createError(e)));
    });
  }

  async function authExternalUser (user, password) {
    if (user.isActive === 0) return next(createError(400, 'Expired Access Timeout'));

    if (moment().isAfter(user.expiredDate)) return next(createError(410, 'Expired Access Timeout'));

    const validPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, null, null, (error, result) => {
        if (error) {
          reject(error);
        }
        const hash = result;

        bcrypt.compare(hash, user.password, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });
    });

    if (!validPassword) {
      return next(createError(404, 'Invalid Login or Password'));
    }

    const token = Auth.createJwtToken({
      login: req.body.login,
    });

    Token.create({
      userId: user.dataValues.id,
      token: token.token,
      expires: token.expires.format(),
    })
      .then(() => {
        res.cookie('authorization', 'Basic ' + token.token, {
          maxAge: config.auth.accessTokenLifetime * 1000,
          httpOnly: true,
        });

        res.json({
          token: token.token,
          expire: token.expires,
          user: userAuthExtension(user),
        });
      })
      .catch(err => next(createError(err)));
  }

  function authSystemUser (user, password) {
    if (user !== config.systemAuth.login || password !== config.systemAuth.password) { return next(createError(404, 'Invalid Login or Password')); }

    const token = SystemAuth.createJwtToken(req.body.login);

    SystemToken.create({
      token: token.token,
      expires: token.expires.format(),
    })
      .then(() => {
        res.cookie('system-authorization', 'Basic ' + token.token, {
          maxAge: config.auth.accessTokenLifetime * 1000,
          httpOnly: true,
        });

        res.json({
          token: token.token,
          expire: token.expires,
        });
      })
      .catch(err => next(createError(err)));
  }
};

exports.logout = function (req, res, next) {
  if (isSystemUser(req)) {
    return systemLogout(req, res, next);
  }
  if (req.isValidKeycloakToken) {
    return keycloakUserLogout(req, res);
  }
  userLogout(req, res, next);
};

function systemLogout (req, res, next) {
  SystemToken.destroy({
    where: {
      token: req.systemToken,
    },
  })
    .then(row => {
      if (!row) return next(createError(404));

      res.cookie('system-authorization', '', {
        maxAge: 0,
        httpOnly: true,
      });

      res.sendStatus(200);
    })
    .catch(err => next(createError(err)));
}

function userLogout (req, res, next) {
  Token.destroy({
    where: {
      user_id: req.user.id,
      token: req.token,
    },
  })
    .then(row => {
      if (!row) return next(createError(404));

      res.cookie('authorization', '', {
        maxAge: 0,
        httpOnly: true,
      });

      userSocketLogout(req, res);
      res.sendStatus(200);
    })
    .catch(err => {
      next(err);
    });
}

function keycloakUserLogout (req, res) {
  res.cookie('authorization', '', {
    maxAge: 0,
    httpOnly: true,
  });
  userSocketLogout(req, res);
  res.sendStatus(200);
}

function userSocketLogout (req, res) {
  res.io
    .of('/')
    .in(`user_${req.user.id}`)
    .clients((error, socketIds) => {
      socketIds.forEach(socketId => res.io.sockets.sockets[socketId].leave(`user_${req.user.id}`));
      console.log('leave: ' + `user_${req.user.id}`);
    });
}

function isSystemUser (req) {
  return req.body.isSystemUser;
}
