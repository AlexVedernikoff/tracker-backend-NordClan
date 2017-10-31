'use strict';
const _ = require('underscore');

const VISOR = 'VISOR';
const ADMIN = 'ADMIN';
const SYSTEM_USER = 'SYSTEM_USER';

/**
 * Устанавливаю методы и свойства для работы с правами в контроллерах
 */
exports.middleware = function (req, res, next) {
  if (!req.user && req.isSystemUser) {
    req.user = {
      dataValues: {
        authorsProjects: [],
        usersProjects: [],
      },
      globalRole: SYSTEM_USER
    };
  }

  const user = req.user;

  user.dataValues.projectsRoles = getProjectsRoles(user);
  user.isVisor = user.globalRole === VISOR;
  user.isGlobalAdmin = user.globalRole === ADMIN;

  user.isAdminOfProject = (projectId) => {
    return user.dataValues.projectsRoles.admin.indexOf(+projectId) !== -1;
  };

  user.isUserOfProject = (projectId) => {
    if (user.isAdminOfProject(projectId)) return true;
    return user.dataValues.projectsRoles.user.indexOf(+projectId) !== -1;
  };

  user.canReadProject = (projectId) => {
    if (user.isGlobalAdmin) return true;
    if (user.isVisor) return true;
    return user.isUserOfProject(projectId);
  };

  user.canUpdateProject = (projectId) => {
    if (user.isGlobalAdmin) return true;
    if (user.isVisor) return false;
    return user.isAdminOfProject(projectId);
  };

  next();
};

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