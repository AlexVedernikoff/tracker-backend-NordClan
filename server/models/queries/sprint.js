const models = require('../');

exports.name = 'sprint';

exports.allSprintsByProject = function(projectId) {

  let result = [];
  return models.Sprint
    .findAll({where: {projectId: projectId, deletedAt: null}, order: [['factStartDate', 'DESC'], ['name', 'ASC']], attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']})
    .then((model) => {
      model.forEach((elModel) => {
        result.push(elModel.dataValues);
      });
      return result;
    });

};

