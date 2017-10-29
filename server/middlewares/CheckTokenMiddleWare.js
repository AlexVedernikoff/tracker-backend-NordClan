const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const User = require('../models/index').User;
const ProjectUsers = require('../models/index').ProjectUsers;
const UserTokens = require('../models/index').Token;
const config = require('../configs/index');
const tokenSecret = 'token_s';

exports.checkToken = function (req, res, next) {
  let token, decoded, authorization;

  if (/\/auth\/login$/ui.test(req.url)){//potential defect /blabla/auth/login - is not validated
    return next();
  }

  if (!doesAuthorizationExist(req)) throw createError(401, 'Need authorization');

  if (isSystemUser(req)) {
    return next();
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
        },
        {
          as: 'projects',
          model: ProjectUsers,
          attributes: ['projectId', 'rolesIds', 'authorId'],
          required: false,
        },
        {
          as: 'myProjects',
          model: ProjectUsers,
          attributes: ['projectId', 'rolesIds', 'authorId'],
          required: false,
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

function doesAuthorizationExist(req) {
  return ((req.headers['system-authorization'] || req.cookies['system-authorization'])
    ||
    (req.headers.authorization || req.cookies.authorization));
}

function isSystemUser(req) {
  return (req.headers['system-authorization'] || req.cookies['system-authorization']);
}