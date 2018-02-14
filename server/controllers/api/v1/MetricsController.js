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

exports.calculate = (req, res, next) => {
  try {
    AgentService.calculate();
    res.sendStatus(200);
  } catch (error) {
    next(createError(error));
  }
};
