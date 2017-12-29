const createError = require('http-errors');
const { Milestones } = require('../../../models');

exports.list = (req, res, next) => {
  Milestones
    .findAll({ where: { projectId: req.params.projectId }})
    .then(milestones => res.json(milestones))
    .catch(e => next(createError(e)));
};

exports.update = (req, res, next) => {
  Milestones
    .update(req.params, { where: { id: req.params.id }, returning: true })
    .then(milestone => res.json(milestone))
    .catch(e => next(createError(e)));
};

exports.delete = async (req, res, next) => {
  Milestones
    .delete({ where: { id: req.params.id }, returning: true })
    .then(milestone => res.json(milestone))
    .catch(e => next(createError(e)));
};
