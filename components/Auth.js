const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const User = require('../models').User;
const UserTokens = require('../models').Token;
const config = require('.././configs');
const tokenSecret = 'token_s';

exports.createJwtToken = createJwtToken;
exports.checkTokenMiddleWare = checkTokenMiddleWare;

function createJwtToken(user) {
  const payload = {
    user: user,
    expires: moment().add(config.auth.accessTokenLifetime, 's')
  };
  return {token: jwt.encode(payload, tokenSecret), expires: payload.expires};
}

function checkTokenMiddleWare(req, res, next) {
  let token, decoded, authorization;

  if (req.url.indexOf('auth/login') > -1){//potential defect /ffff/auth/loginfdfgdfd - is not validated
    return next();
  }

  if (!req.headers.authorization && !req.cookies.authorization) {
    return next(createError(401, 'Need  authorization'));
  }


  try {
    authorization = req.headers.authorization? req.headers.authorization : req.cookies.authorization;
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
        login: decoded.user.login
      },
      attributes: ['id']
    })
    .then((user) => {
      if(!user) return next(createError(401, 'No such user in the system'));

      UserTokens
        .findOne({
          where: {
            user_id: user.dataValues.id,
            token: token
          },
          attributes: ['expires']
        })
        .then((token) => {
          if (!token) return next(createError(401, 'No such access token in the system'));
          if (moment().isAfter(token.expires)) return next(createError(401, 'Access token has expired'));
          req.user = user;

          return next();
        })
        .catch((err) => next(createError(err)));

    })
    .catch((err) => next(createError(err)));
  
}