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

exports.delete = (req, res, next) => {
  if (!req.params.id.match(/^[0-9]+$/)) {
    return next(createError(400, 'id must be int'));
  }
  Milestone
    .findByPrimary(req.params.id, { attributes: ['id'] })
    .then((milestone) => {
      if (!milestone) {
        return next(createError(404));
      }
      return milestone.destroy()
        .then(()=>{
          res.end();
        });
    })
    .catch((err) => {
      next(err);
    });
};
