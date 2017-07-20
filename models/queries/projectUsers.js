const models = require('../');

exports.name = 'projectUsers';

exports.getUsersByProject = function(projectId) {
  let response = [];

  return models.ProjectUsers
    .findAll({
      where: {
        projectId: projectId,
        deletedAt: null
      },
      attributes: ['userId', 'rolesIds'],
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
          rolesIds: rolesIds ? rolesIds.map((el) => +el) : null,
        });
      });

      return response;
    });

};

