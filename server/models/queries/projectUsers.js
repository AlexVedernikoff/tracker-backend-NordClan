const models = require('../');

exports.name = 'projectUsers';

exports.getTransRolesToObject = getTransRolesToObject;
exports.getUsersByProject = function (projectId, isExternal, attributes = ['userId', 'rolesIds'], t = null) {
  return models.ProjectUsers
    .findAll({
      where: {
        projectId: projectId,
        deletedAt: null
      },
      transaction: t,
      attributes: attributes,
      include: [
        {
          as: 'user',
          model: models.User,
          where: {
            active: 1,
            isActive: {
              $ne: 0
            },
            globalRole: isExternal ? models.User.EXTERNAL_USER_ROLE : { $not: models.User.EXTERNAL_USER_ROLE }
          },
          attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'login']
        },
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      order: [
        ['id', 'DESC']
        // [{ model: models.User, as: 'user' }, 'lastNameRu', 'ASC'],
        // [{ model: models.User, as: 'user' }, 'firstNameRu', 'ASC']
      ]
    })
    .then(async (projectUsers) => {
      const projectRoles = await models.ProjectRolesDictionary.findAll();
      return projectUsers.map((projectUser) => {
        return {
          ...projectUser.user.get(),
          fullNameRu: projectUser.user.fullNameRu,
          fullNameEn: projectUser.user.fullNameEn,
          roles: getTransRolesToObject(projectUser.roles, projectRoles)
        };
      });

    })
    .catch(error => {
      throw error;
    });

};


exports.getUserRolesByProject = function (projectId, userId, t = null) {

  return models.ProjectUsers
    .findAll({
      where: {
        projectId: projectId,
        userId: userId,
        deletedAt: null
      },
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      transaction: t
    })
    .then((projectUsers) => {
      let rolesIds;
      projectUsers.forEach((projectUser) => {
        rolesIds = projectUser.roles.map((role) => role.projectRoleId);
      });
      return rolesIds;
    });
};


function getTransRolesToObject (rolesIds, projectRoles) {
  const projectRoleIds = rolesIds ? rolesIds.map((role) => role.projectRoleId) : [];

  return projectRoles.reduce((acc, el) => ({
    ...acc,
    [el.code]: projectRoleIds.indexOf(el.id) > -1
  }), {});
}
