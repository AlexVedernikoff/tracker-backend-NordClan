'use strict';
const models = require('../../models');
const _ = require('underscore');

const VISOR = 'VISOR';
const ADMIN = 'ADMIN';
const SYSTEM_USER = 'SYSTEM_USER';

/**
 * Устанавливаю методы и свойства для работы с правами в контроллерах
 */
exports.middleware = function (req, res, next) {
  if (!req.user && !req.isSystemUser) {
    return next();
  }

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
  user.dataValues.projects = [ ...user.dataValues.projectsRoles.user, ...user.dataValues.projectsRoles.admin];
  user.isVisor = user.globalRole === VISOR;
  user.isGlobalAdmin = user.globalRole === ADMIN;

  user.isAdminOfProject = function (projectId) {
    return this.dataValues.projectsRoles.admin.indexOf(+projectId) !== -1;
  };
  user.isUserOfProject = function (projectId) {
    return this.isAdminOfProject(projectId) || user.dataValues.projectsRoles.user.indexOf(+projectId) !== -1;
  };
  user.canReadProject = function (projectId) {
    return this.isGlobalAdmin || this.isVisor || this.isUserOfProject(projectId);
  };
  user.canUpdateProject = function (projectId) {
    return this.isGlobalAdmin || this.isAdminOfProject(projectId);
  };
  user.canCreateCommentProject = function (projectId) {
    return this.isGlobalAdmin || this.isUserOfProject(projectId);
  };
  user.canUpdateCommentProject = function (projectId) {
    return this.isGlobalAdmin || this.isUserOfProject(projectId);
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