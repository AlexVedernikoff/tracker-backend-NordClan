const models = require('../');

exports.name = 'projectUsers';

exports.getTransRolesToObject = getTransRolesToObject;
exports.getUsersByProject = function (projectId, isExternal, attributes = ['userId', 'rolesIds'], t = null) {
  return models.ProjectUsers
    .findAll({
      where: {
        projectId: projectId,
        deletedAt: null,
      },
      transaction: t,
      attributes: attributes,
      include: [
        {
          as: 'user',
          model: models.User,
          where: {
            $or: [
              {
                active: 1,
                globalRole: {
                  $not: models.User.EXTERNAL_USER_ROLE,
                },
              },
              {
                active: 1,
                isActive: 1,
                globalRole: models.User.EXTERNAL_USER_ROLE,
              },
            ],
            globalRole: isExternal ? models.User.EXTERNAL_USER_ROLE : { $not: models.User.EXTERNAL_USER_ROLE },
          },
          attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'login'],
        },
        {
          as: 'roles',
          model: models.ProjectUsersRoles,
        },
        {
          as: 'gitlabRoles',
          model: models.GitlabUserRoles,
        },
      ],
      order: [
        ['id', 'DESC'],
        // [{ model: models.User, as: 'user' }, 'lastNameRu', 'ASC'],
        // [{ model: models.User, as: 'user' }, 'firstNameRu', 'ASC']
      ],
    })
    .then(async (projectUsers) => {
      const projectRoles = await models.ProjectRolesDictionary.findAll();
      return projectUsers.map((projectUser) => {
        return {
          ...projectUser.user.get(),
          fullNameRu: projectUser.user.fullNameRu,
          fullNameEn: projectUser.user.fullNameEn,
          roles: getTransRolesToObject(projectUser.roles, projectRoles),
          gitlabRoles: projectUser.gitlabRoles,
        };
      });

    });

};


exports.getUserRolesByProject = function (projectId, userId, t = null) {

  return models.ProjectUsers
    .findAll({
      where: {
        projectId: projectId,
        userId: userId,
        deletedAt: null,
      },
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles,
        },
      ],
      transaction: t,
    })
    .then((projectUsers) => {
      let rolesIds;
      projectUsers.forEach((projectUser) => {
        rolesIds = projectUser.roles.map((role) => role.projectRoleId);
      });
      return rolesIds;
    });
};

exports.findAllUsersByProjectId = function (projectId) {
  return models.ProjectUsers.findAll({
    where: {
      projectId,
    },
  });
};


function getTransRolesToObject (rolesIds, projectRoles) {
  const projectRoleIds = rolesIds ? rolesIds.map((role) => role.projectRoleId) : [];

  return projectRoles.reduce((acc, el) => ({
    ...acc,
    [el.code]: projectRoleIds.indexOf(el.id) > -1,
  }), {});
}
