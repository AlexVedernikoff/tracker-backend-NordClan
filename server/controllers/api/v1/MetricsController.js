const createError = require('http-errors');
const AgentService = require('../../../services/agent');

exports.list = async (req, res, next) => {
  const errors = AgentService.validate(req.body);

  if (errors) {
    next(createError(errors));
  }

  AgentService
    .list(req.body)
    .then(metrics => res.json(metrics))
    .catch(e => next(createError(e)));
};

exports.calculate = async (req, res, next) => {
  if (!req.params.projectId && !req.params.projectId.match(/^[0-9]+$/)) {
    return next(createError(400, 'projectId id must be int'));
  }
  try {
    await AgentService.calculateByProject(req.params.projectId).then(async () => {
      await AgentService
        .list(req.body)
        .then(metrics => res.json(metrics));
    });
  } catch (error) {
    next(createError(error));
  }
};
