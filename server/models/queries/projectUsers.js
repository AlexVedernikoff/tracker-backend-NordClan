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
      const requests = [];
      projectUsers.map((projectUser) => {
        requests.push(async () => {
          projectUser.roles = await getTransRolesToObject(projectUser.roles);
          return projectUser;
        });
        return {
          ...projectUser.user.get(),
          fullNameRu: projectUser.user.fullNameRu,
          fullNameEn: projectUser.user.fullNameEn
        };
      });
      await Promise.all(requests);
      return projectUsers;
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


async function getTransRolesToObject (rolesIds) {
  const projectRoleIds = rolesIds ? rolesIds.map((role) => role.projectRoleId) : [];

  const projectRoles = await models.ProjectRolesDictionary.findAll();

  return projectRoles.reduce((acc, el) => ({
    ...acc,
    [el.code]: projectRoleIds.indexOf(el.id) > -1
  }), {});
}
