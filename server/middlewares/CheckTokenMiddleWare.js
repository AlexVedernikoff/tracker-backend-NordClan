const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const models = require('../models/index');
const User = models.User;
const ProjectUsers = models.ProjectUsers;
const Project = models.Project;
const UserTokens = models.Token;
const config = require('../configs/index');
const tokenSecret = 'token_s';
const _ = require('underscore');

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
          as: 'usersProjects',
          model: ProjectUsers,
          attributes: ['projectId', 'rolesIds'],
          required: false,
        },
        {
          as: 'authorsProjects',
          model: Project,
          attributes: ['id'],
          required: false,
        },
        {
          model: models.Department,
          as: 'department',
          required: false,
          attributes: ['name'],
          through: {
            model: models.UserDepartments,
            attributes: []
          },
        },
      ]
    })
    .then((user) => {
      if(!user) throw createError(401, 'No found user or access in the system. Or access token has expired');

      if(user.dataValues.department[0]) {
        user.dataValues.department = user.dataValues.department[0].name;
      }

      user.dataValues.projectsRoles = getProjectsRoles(user);
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

function getProjectsRoles (user) {
  const administeredProjects = user.dataValues.authorsProjects.map(o => o.dataValues.id);
  let projectsParticipant = [];

  const usersProjects = user.dataValues.usersProjects.map(o => o.dataValues);
  usersProjects.map(project => {
    const rolesIds = JSON.parse(project.rolesIds);
    if (contains(rolesIds, models.ProjectRolesDictionary.ADMIN_IDS)) {
      administeredProjects.push(project.projectId);
    } else {
      projectsParticipant.push(project.projectId);
    }
  });
  projectsParticipant = _.difference(projectsParticipant, administeredProjects);

  delete user.dataValues.token;
  delete user.dataValues.authorsProjects;
  delete user.dataValues.usersProjects;
  
  return {
    admin: administeredProjects,
    user: projectsParticipant,
  };
}

function contains (where, what){
  for(let i=0; i < what.length; i++){
    if(where.indexOf(what[i]) !== -1) return true;
  }
  return false;
}