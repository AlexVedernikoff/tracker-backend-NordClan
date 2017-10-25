const createError = require('http-errors');
// const ProjectHistoryService = require('../services/history/project');
const TaskHistoryService = require('../services/history/task/index');

exports.list = function(req, res, next){
  if(req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if(req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));

  req.query.pageSize = req.query.pageSize || 25;
  req.query.currentPage = req.query.currentPage || 1;

  const entity = req.params.entity;
  const entityId = req.params.entityId;
  const pageSize = req.query.pageSize;
  const currentPage = req.query.currentPage;

  const services = {
    // project: ProjectHistoryService,
    task: TaskHistoryService
  };

  services[entity]()
    .call(entityId, pageSize, currentPage)
    .then(histories => res.json(histories))
    .catch(error => next(error));
};
