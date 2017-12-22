const createError = require('http-errors');
const moment = require('moment');
const ldap = require('ldapjs');
const Auth = require('../../../middlewares/CheckTokenMiddleWare');
const SystemAuth = require('../../../middlewares/CheckSystemTokenMiddleWare');
const models = require('../../../models');
const { User, Token, SystemToken } = models;
const queries = require('../../../models/queries');
const config = require('../../../configs');

exports.login = function (req, res, next){
  if (!req.body.login || !req.body.password) return next(createError(401, 'Login and password are required'));

  if (isSystemUser(req)) {
    return authSystemUser(req.body.login, req.body.password);
  }

  User.findOne({
    where: {
      login: req.body.login,
      active: 1
    },
    attributes: User.defaultSelect.concat('ldapLogin')
  })
    .then((user) => {
      if (!user) return next(createError(404, 'Invalid Login or Password'));

      queries.token.deleteExpiredTokens(user);
      authLdap(user, req.body.password);
    })
    .catch((err) => {
      next(err);
    });


  function authLdap (user, password) {
    const client = ldap.createClient({
      url: config.ldapUrl
    });

    client.bind('cn=' + user.ldapLogin + ',cn=People,dc=simbirsoft', password, function (err) {
      if (err) {
        client.unbind();
        return next(createError(err));
      }

      const token = Auth.createJwtToken({
        login: req.body.login
      });

      Token
        .create({
          userId: user.dataValues.id,
          token: token.token,
          expires: token.expires.format()
        })
        .then(() => {
          res.cookie('authorization', 'Basic ' + token.token, {
            maxAge: config.auth.accessTokenLifetime * 1000,
            httpOnly: true
          });
          user.dataValues.birthDate = moment(user.dataValues.birthDate).format('YYYY-DD-MM');
          delete user.dataValues.ldapLogin;

          res.json({
            token: token.token,
            expire: token.expires,
            user: user.dataValues
          });
        })
        .catch((e) => next(createError(e)));

    });
  }

  function authSystemUser (user, password) {

    if (
      user !== config.systemAuth.login
      || password !== config.systemAuth.password
    ) return next(createError(404, 'Invalid Login or Password'));

    const token = SystemAuth.createJwtToken(req.body.login);

    SystemToken
      .create({
        token: token.token,
        expires: token.expires.format()
      })
      .then(() => {
        res.cookie('system-authorization', 'Basic ' + token.token, {
          maxAge: config.auth.accessTokenLifetime * 1000,
          httpOnly: true
        });


        res.json({
          token: token.token,
          expire: token.expires
        });
      })
      .catch((err) => next(createError(err)));
  }
};


exports.logout = function (req, res, next) {
  if (isSystemUser(req)) {
    return systemLogout(req, res, next);
  }
  userLogout(req, res, next);
};

function systemLogout (req, res, next) {
  SystemToken
    .destroy({
      where: {
        token: req.systemToken
      }
    })
    .then((row) => {
      if (!row) return next(createError(404));

      res.cookie('system-authorization', '', {
        maxAge: 0,
        httpOnly: true
      });

      res.sendStatus(200);
    })
    .catch((err) => next(createError(err)));
}

function userLogout (req, res, next) {
  Token.destroy({
    where: {
      user_id: req.user.id,
      token: req.token
    }
  })
    .then((row) => {
      if (!row) return next(createError(404));

      res.cookie('authorization', '', {
        maxAge: 0,
        httpOnly: true
      });

      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
}


function isSystemUser (req) {
  return req.body.isSystemUser;
}
