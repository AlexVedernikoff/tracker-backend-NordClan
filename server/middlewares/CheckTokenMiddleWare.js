const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const models = require('../models/index');
const User = models.User;
const ProjectUsers = models.ProjectUsers;
const { Task } = models;
const Project = models.Project;
const UserTokens = models.Token;
const config = require('../configs/index');
const tokenSecret = 'token_s';
const { statuses } = require('../middlewares/Access/userAuthExtension');
const { applyMidlleware } = require('../components/utils');
const Keycloak = require('keycloak-connect');
const keycloak = new Keycloak({ bearerOnly: true }, config.keycloak);

const validateKeycloakToken = (req, res, next) => {
  // had to do fake handlers to prevent keycloak call res.end() for invalid token and allow to use next middleware
  const originalStatusHandler = res.status;
  const originalEndHandler = res.end;
  const _noop = () => {};
  const restoreReqHandlers = () => {
    res.status = originalStatusHandler;
    res.end = originalEndHandler;
  };
  const fakeResponseEnd = () => {
    restoreReqHandlers();
    req.isValidKeycloakToken = false;
    next();
  };
  res.status = _noop;
  res.end = fakeResponseEnd;
  keycloak.protect()(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    restoreReqHandlers();
    req.isValidKeycloakToken = true;
    next();
  });
};

const validateDefaultToken = (req, res, next) => {
  if (!req.isValidKeycloakToken) {
    try {
      const authorization = req.cookies.authorization ? req.cookies.authorization : req.headers.authorization;
      req.token = authorization.split(' ')[1];
      req.decoded = jwt.decode(req.token, tokenSecret);
    } catch (err) {
      return next(createError(403, 'Can not parse access token - it is not valid'));
    }
  }
  next();
};

const handleToken = (req, res, next) => {
  const userQuery = {
    attributes: ['globalRole', ...User.defaultSelect],
    include: [
      {
        as: 'usersProjects',
        model: ProjectUsers,
        attributes: ['projectId'],
        include: [
          {
            as: 'roles',
            model: models.ProjectUsersRoles
          }
        ],
        required: false
      },
      {
        as: 'authorsProjects',
        model: Project,
        attributes: ['id'],
        required: false
      },
      {
        model: models.Department,
        as: 'department',
        required: false,
        attributes: ['name'],
        through: {
          model: models.UserDepartments,
          attributes: []
        }
      }
    ]
  };
  if (req.isValidKeycloakToken) {
    const { email } = req.kauth.grant.access_token.content;
    userQuery.where = {
      emailPrimary: email,
      active: 1
    };
  } else {
    userQuery.where = {
      login: req.decoded.user.login,
      active: 1
    };
    userQuery.include.push({
      as: 'token',
      model: UserTokens,
      attributes: ['expires'],
      required: true,
      where: {
        token: req.token,
        expires: {
          $gt: moment().format() // expires > now
        }
      }
    });
  }
  User.findOne(userQuery)
    .then(user => {
      if (user) {
        if (user.dataValues.globalRole === statuses.DEV_OPS) {
          return Task.findAll({
            attributes: ['projectId'],
            where: {
              isDevOps: true
            }
          }).then((tasks) => {
            if (tasks !== 0) {
              user.devOpsProjects = tasks.map(task => task.projectId);
            }
            return user;
          });
        } else {
          return user;
        }
      } else {
        return user;
      }
    })
    .then(user => {
      if (!user) {
        return next(createError(401, 'No found user or access in the system. Or access token has expired'));
      }
      if (user.dataValues.department[0]) {
        user.dataValues.department = user.dataValues.department[0].name;
      }
      req.user = user;
      return next();
    }).catch(err => next(err));
};

exports.checkToken = async (req, res, next) => {
  if ((/\/auth\/login$/iu).test(req.url) || (/\/user\/password/iu).test(req.url)) {
    //potential defect /blabla/auth/login - is not validated
    return next();
  }
  if (!doesAuthorizationExist(req)) {
    return next(createError(401, 'Need authorization'));
  }
  if (isSystemUser(req)) {
    return next();
  }
  if (!req.headers.authorization && req.cookies.authorization) {
    req.headers.authorization = req.cookies.authorization;
  }
  try {
    await applyMidlleware([...keycloak.middleware(), validateKeycloakToken, validateDefaultToken, handleToken], req, res);
    next();
  } catch (err) {
    next(err);
  }
};

exports.getUserByToken = async function (header) {
  if (!doesAuthorizationSocket(header)) {
    return Promise.resolve(null);
  }
  const headerObj = header.cookie.split(';').reduce((acc, cur) => {
    const arr = cur.trim().split('=');
    acc[arr[0]] = arr[1];
    return acc;
  }, {});
  // had to emulate express req\res objects, because keycloak has no method for socket requests
  const tokenHeader = headerObj.authorization.replace('%20', ' ');
  const fakeRequest = {
    headers: {
      'authorization': tokenHeader
    },
    body: {},
    cookies: {},
    query: {},
    params: {},
    get: () => null
  };
  const fakeResponse = {
    status: null,
    end: null
  };
  await applyMidlleware([...keycloak.middleware(), validateKeycloakToken, validateDefaultToken, handleToken], fakeRequest, fakeResponse);
  return fakeRequest.user;
};

exports.createJwtToken = function (user) {
  const payload = {
    user: user,
    expires: moment().add(config.auth.accessTokenLifetime, 's')
  };
  return { token: jwt.encode(payload, tokenSecret), expires: payload.expires };
};

function doesAuthorizationExist (req) {
  return (
    req.headers['system-authorization']
    || req.cookies['system-authorization']
    || (req.headers.authorization || req.cookies.authorization)
  );
}

function doesAuthorizationSocket (header) {
  return header.cookie || header.authorization;
}

function isSystemUser (req) {
  return req.headers['system-authorization'] || req.cookies['system-authorization'];
}
