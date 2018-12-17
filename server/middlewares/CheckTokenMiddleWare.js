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

exports.checkToken = function (req, res, next) {
  let token, decoded, authorization;

  if (/\/auth\/login$/ui.test(req.url) || (/\/user\/password/ui).test(req.url)){//potential defect /blabla/auth/login - is not validated
    return next();
  }

  if (!doesAuthorizationExist(req)) {
    return next(createError(401, 'Need authorization'));
  }

  if (isSystemUser(req)) {
    return next();
  }

  try {
    authorization = req.cookies.authorization ? req.cookies.authorization : req.headers.authorization;

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
        active: 1
      },
      attributes: ['globalRole', ...User.defaultSelect],
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
    })
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
    .then((user) => {
      if (!user) {
        return next(createError(401, 'No found user or access in the system. Or access token has expired'));
      }
      if (user.dataValues.department[0]) {
        user.dataValues.department = user.dataValues.department[0].name;
      }

      req.user = user;

      return next();
    })
    .catch((err) => next(err));
};

exports.getUserByToken = function (header) {
  if (!doesAuthorizationSocket(header)) {
    return Promise.resolve(null);
  }

  try {
    const headerObj = header.cookie.split(';').reduce((acc, cur) => {
      const arr = (cur.trim()).split('=');
      acc[arr[0]] = arr[1];
      return acc;
    }, {});

    const token = headerObj.authorization.split('%20')[1];
    const decoded = jwt.decode(token, tokenSecret);


    return User.findOne({
      where: {
        login: decoded.user.login,
        active: 1
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
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.createJwtToken = function (user) {
  const payload = {
    user: user,
    expires: moment().add(config.auth.accessTokenLifetime, 's')
  };
  return {token: jwt.encode(payload, tokenSecret), expires: payload.expires};
};

function doesAuthorizationExist (req) {
  return ((req.headers['system-authorization'] || req.cookies['system-authorization'])
    || (req.headers.authorization || req.cookies.authorization));
}

function doesAuthorizationSocket (header) {
  return header.cookie || header.authorization;
}

function isSystemUser (req) {
  return (req.headers['system-authorization'] || req.cookies['system-authorization']);
}
