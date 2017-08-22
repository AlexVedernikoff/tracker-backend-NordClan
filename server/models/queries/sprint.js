const models = require('../');

exports.name = 'sprint';

exports.allSprintsByProject = function(projectId, attributes = ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime'], t = null) {

  let result = [];
  return models.Sprint
    .findAll({
      attributes: attributes,
      where: {
        projectId: projectId,
        deletedAt: null
      },
      order: [
        ['factStartDate', 'ASC'],
        ['name', 'ASC']
      ],
      transaction: t
    })
    .then((model) => {
      model.forEach((elModel) => {
        result.push(elModel.dataValues);
      });
      return result;
    });

};

