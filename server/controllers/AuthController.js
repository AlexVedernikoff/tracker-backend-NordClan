const createError = require('http-errors');
const moment = require('moment');
const ldap = require('ldapjs');
const Auth = require('../middlewares/CheckTokenMiddleWare');
const SystemAuth = require('../middlewares/CheckSystemTokenMiddleWare');
const User = require('../models').User;
const Token = require('../models').Token;
const SystemToken = require('../models').SystemToken;
const queries = require('../models/queries');
const config = require('.././configs');

const ldapUrl = 'ldap://auth.simbirsoft:389/dc=simbirsoft';

exports.login = function(req, res, next){
  if (!req.body.login || !req.body.password) return next(createError(401, 'Login and password are required'));
  if (!req.headers.origin) return next(createError(401, 'header "origin" are required'));

  if (isSystemUser(req)) { // String потому-что хочу что бы работало в сваггере тоже
    return authSystemUser(req.body.login, req.body.password);
  }

  User.findOne({
    where: {
      login: req.body.login,
      active: 1,
    },
    attributes: User.defaultSelect.concat('ldapLogin'),
  })
    .then((user) => {
      if(!user) return next(createError(404, 'Invalid Login or Password'));
  
      queries.token.deleteExpiredTokens(user);
      authLdap(user, req.body.password);
    })
    .catch((err) => {
      next(err);
    });


  function authLdap(user, password) {
    const client = ldap.createClient({
      url: ldapUrl
    });

    client.bind('cn=' + user.ldapLogin + ',cn=People,dc=simbirsoft', password, function(err) {
      if(err) {
        client.unbind();
        return next(createError(err));
      }

      const token = Auth.createJwtToken({
        login: req.body.login,
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
            domain: extractHostname(req.headers.origin),
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
        .catch((err) => next(createError(err)));

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
          domain: extractHostname(req.headers.origin),
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


exports.logout = function(req, res, next) {
  if (isSystemUser(req)) { // String потому-что хочу что бы работало в сваггере тоже
    return systemLogout(req, res, next);
  }
  userLogout(req, res, next);
};

function systemLogout (req, res, next) {
  SystemToken
    .destroy({
      where: {
        token: req.token
      }
    })
    .then((row) => {
      if(!row) return next(createError(404));

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
      if(!row) return next(createError(404));

      res.cookie('authorization', '', {
        maxAge: 0,
        domain: extractHostname(req.headers.origin),
        httpOnly: true
      });

      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
}


function isSystemUser(req) {
  return (String(req.body.isSystemUser)  === 'true');
}

function extractHostname(url) {
  let hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];
  return hostname;
}