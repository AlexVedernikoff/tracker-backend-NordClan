const createError = require('http-errors');
const models = require('../../../models');
const historyService = require('../../../services/history/index');

exports.list = async function (req, res, next){
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));

  if (req.params.entity === 'project' && !req.user.canReadProject(req.params.entityId)) {
    return next(createError(403, 'Access denied'));
  }
  if (req.params.entity === 'task') {
    const task = await models.Task.findByPrimary(req.params.entityId, {
      attributes: ['id', 'projectId'],
    });
    if (!req.user.canReadProject(task.projectId)) {
      return next(createError(403, 'Access denied'));
    }
  }

  req.query.pageSize = req.query.pageSize || 25;
  req.query.currentPage = req.query.currentPage || 1;

  const entity = req.params.entity;
  const entityId = req.params.entityId;
  const pageSize = req.query.pageSize;
  const currentPage = req.query.currentPage;

  historyService(entity)
    .call(entityId, pageSize, currentPage)
    .then(histories => res.json(histories))
    .catch(error => next(error));
};
