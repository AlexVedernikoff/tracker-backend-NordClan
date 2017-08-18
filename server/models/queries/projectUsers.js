const models = require('../');

exports.name = 'projectUsers';

exports.getTransRolesToObject = getTransRolesToObject;
exports.getUsersByProject = function(projectId, attributes = ['userId', 'rolesIds'],  t = null) {
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
        }
      ],
      order: [
        [{model: models.User, as: 'user'}, 'lastNameRu', 'ASC'],
        [{model: models.User, as: 'user'}, 'firstNameRu', 'ASC']
      ]
    })
    .then((projectUsers) => {
      projectUsers.forEach((projectUser) => {
        const rolesIds = JSON.parse(projectUser.rolesIds);
        response.push({
          id: projectUser.user.id,
          fullNameRu: projectUser.user.fullNameRu,
          roles: getTransRolesToObject(rolesIds),
        });
      });

      return response;
    });

};

  
function getTransRolesToObject(rolesIds) {
  const result = {};
  if(rolesIds) rolesIds = rolesIds.map((el) => +el);
  
  models.ProjectRolesDictionary.values.forEach(el => {
    result[el.code] = (rolesIds) ?
      (rolesIds.indexOf(el.id) > -1)
      : false;
  });
  
  return result;
};