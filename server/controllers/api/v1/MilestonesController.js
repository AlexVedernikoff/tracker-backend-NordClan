const createError = require('http-errors');
const { Milestone } = require('../../../models');

exports.create = (req, res, next) => {
  const params = {
    ...req.body,
    done: false
  };

  Milestone
    .create(params)
    .then(milestones => res.json(milestones))
    .catch(e => next(createError(e)));
};

exports.update = (req, res, next) => {
  Milestone
    .update(req.body, { where: { id: req.params.id }, returning: true })
    .then(milestone => res.json(milestone[1][0]))
    .catch(e => next(createError(e)));
};
