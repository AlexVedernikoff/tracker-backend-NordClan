const models = require('../');

exports.name = 'projectUsers';

exports.getTransRolesToObject = getTransRolesToObject;
exports.getUsersByProject = function (projectId, attributes = ['userId', 'rolesIds'], t = null) {
  let response = [];

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
          attributes: ['id', 'firstNameRu', 'lastNameRu'],
        },
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      order: [
        [{ model: models.User, as: 'user' }, 'lastNameRu', 'ASC'],
        [{ model: models.User, as: 'user' }, 'firstNameRu', 'ASC']
      ]
    })
    .then((projectUsers) => {
      projectUsers.forEach((projectUser) => {
        response.push({
          id: projectUser.user.id,
          fullNameRu: projectUser.user.fullNameRu,
          roles: getTransRolesToObject(projectUser.roles),
        });
      });

      return response;
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



function getTransRolesToObject(rolesIds) {
  const result = {};
  if (rolesIds) rolesIds = rolesIds.map((role) => role.projectRoleId);

  models.ProjectRolesDictionary.values.forEach(el => {
    result[el.code] = (rolesIds) ?
      (rolesIds.indexOf(el.id) > -1)
      : false;
  });

  return result;
}