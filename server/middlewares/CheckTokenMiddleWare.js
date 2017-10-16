const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const User = require('../models/index').User;
const UserTokens = require('../models/index').Token;
const config = require('../configs/index');
const tokenSecret = 'token_s';
const tokenSecretSystem = 'wywirec.';

exports.checkToken = function (req, res, next) {
  let token, decoded, authorization;

  if (req.url.indexOf('auth/login') > -1){//potential defect /ffff/auth/loginfdfgdfd - is not validated
    return next();
  }

  if (!req.headers.authorization && !req.cookies.authorization) {
    return next(createError(401, 'Need  authorization'));
  }


  try {
    authorization = req.cookies.authorization? req.cookies.authorization : req.headers.authorization;

    token = authorization.split(' ')[1];
    decoded = jwt.decode(token, tokenSecret);
    req.token = token;
    req.decoded = decoded;
  } catch (err) {
    return next(createError(403, 'Can not parse access token - it is not valid'));
  }
  
  User
    .findOne({
      where: {
        login: decoded.user.login,
        active: 1,
      },
      attributes: User.defaultSelect,
      include: [
        {
          as: 'token',
          model: UserTokens,
          attributes: ['expires'],
          required: true,
          where: {
            token: token,
            expires: {
              $gt: moment().format() // expires > now
            }
          }
        }
      ]
    })
    .then((user) => {
      if(!user) throw createError(401, 'No found user or access in the system. Or access token has expired');
      req.user = user;
      return next();
    })
    .catch((err) => next(err));
  
};

exports.createJwtToken = function (user) {
  const payload = {
    user: user,
    expires: moment().add(config.auth.accessTokenLifetime, 's')
  };
  return {token: jwt.encode(payload, tokenSecret), expires: payload.expires};
};

exports.createSystemJwtToken = function () {
  const expires = moment().add(config.systemAuth.accessTokenLifetime, 's');
  return {token: jwt.encode(expires, tokenSecretSystem, 'HS512'), expires: expires};
};
