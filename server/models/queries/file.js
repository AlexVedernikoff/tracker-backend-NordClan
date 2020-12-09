const models = require('../');

exports.name = 'file';

exports.getFilesByModel = function (modelFileName, modelId) {
  const result = [];
  const where = {
    deletedAt: null,
  };

  switch (modelFileName) {
  case 'ProjectAttachments':
    where.projectId = modelId;
    break;
  case 'TaskAttachments':
    where.taskId = modelId;
    break;
  case 'TestCaseAttachments':
    where.testCaseId = modelId;
    break;
  case 'TestStepExecutionAttachments':
    where.testStepExecutionId = modelId;
    break;
  case 'TestCaseExecutionAttachments':
    where.testCaseExecutionId = modelId;
    break;
  default:
    break;
  }

  return models[modelFileName]
    .findAll({
      where: where,
      attributes: models[modelFileName].defaultSelect,
      order: [
        ['createdAt', 'ASC'],
      ],
    })
    .then(items => {
      items.forEach((model) => {
        result.push(model.dataValues);
      });
      return result;
    });
};
