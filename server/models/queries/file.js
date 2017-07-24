const models = require('../');

exports.name = 'file';

exports.getFilesByModel = function(modelFileName, modelId) {
  let result = [];
  const where = {
    deletedAt: null,
  };
  
  switch(modelFileName) {
  case 'ProjectAttachments':
    where.projectId = modelId;
    break;
  case 'TaskAttachments':
    where.taskId = modelId;
    break;
  }
  
  return models[modelFileName]
    .findAll({
      where: where,
      attributes: models[modelFileName].defaultSelect
      
    })
    .then((models) => {
      models.forEach((model) => {
        result.push(model.dataValues);
      });
      return result;
    });
};