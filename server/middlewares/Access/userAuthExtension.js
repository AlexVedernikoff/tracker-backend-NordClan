const models = require('../../models');
const _ = require('underscore');
const { Task } = models;

const statuses = {
  VISOR: 'VISOR',
  ADMIN: 'ADMIN',
  SYSTEM_USER: 'SYSTEM_USER',
  USER: 'SYSTEM_USER',
  EXTERNAL_USER: 'EXTERNAL_USER',
  DEV_OPS: 'DEV_OPS'
};

exports.statuses = statuses;

exports.userAuthExtension = function (user, isSystemUser = false) {
  if (isSystemUser) {
    return getSystemUser();
  }

  const extensibleUser = user;
  extensibleUser.dataValues.projectsRoles = getProjectsRoles(extensibleUser);
  extensibleUser.dataValues.projects = [
    ...extensibleUser.dataValues.projectsRoles.user,
    ...extensibleUser.dataValues.projectsRoles.admin
  ];

  extensibleUser.isVisor = extensibleUser.globalRole === statuses.VISOR;
  extensibleUser.isGlobalAdmin = extensibleUser.globalRole === statuses.ADMIN;
  extensibleUser.isDevOps = extensibleUser.globalRole === statuses.DEV_OPS;

  extensibleUser.isAdminOfProject = function (projectId) {
    return this.dataValues.projectsRoles.admin.indexOf(+projectId) !== -1 || extensibleUser.isGlobalAdmin;
  };
  extensibleUser.isUserOfProject = function (projectId) {
    return this.isAdminOfProject(projectId) || this.dataValues.projectsRoles.user.indexOf(+projectId) !== -1;
  };
  extensibleUser.canReadProject = function (projectId) {
    return this.isDevOps
      ? this.isUserOfProject(projectId) || this.devOpsProjects.indexOf(+projectId) !== -1
      : this.isGlobalAdmin || this.isVisor || this.isUserOfProject(projectId);
  };
  extensibleUser.isDevOpsProject = function (projectId) {
    return this.devOpsProjects
      ? !this.isUserOfProject(projectId) && (this.devOpsProjects.indexOf(+projectId) !== -1)
      : false;
  };
  extensibleUser.canUpdateProject = function (projectId) {
    return this.isGlobalAdmin || this.isAdminOfProject(projectId);
  };
  extensibleUser.canCreateCommentProject = function (projectId) {
    return this.isGlobalAdmin || this.isUserOfProject(projectId);
  };
  extensibleUser.canUpdateCommentProject = function (projectId) {
    return this.isGlobalAdmin || this.isUserOfProject(projectId);
  };

  return extensibleUser;
};

function getProjectsRoles (user) {
  const administeredProjects = user.dataValues.authorsProjects.map(o => o.dataValues.id);
  let projectsParticipant = [];

  const usersProjects = user.dataValues.usersProjects.map(o => o.dataValues);
  usersProjects.map(project => {
    const rolesIds = project.roles ? project.roles.map((role) => role.projectRoleId) : [];
    const isAdmin = rolesIds.some(id => models.ProjectRolesDictionary.ADMIN_IDS.indexOf(id) !== -1);

    if (isAdmin) {
      administeredProjects.push(project.projectId);
    } else {
      projectsParticipant.push(project.projectId);
    }
  });
  projectsParticipant = _.difference(projectsParticipant, administeredProjects);

  return {
    admin: administeredProjects,
    user: projectsParticipant
  };
}

function getSystemUser () {
  return {
    dataValues: {
      authorsProjects: [],
      usersProjects: []
    },
    globalRole: statuses.SYSTEM_USER
  };
}
