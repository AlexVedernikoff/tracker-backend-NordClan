const createError = require('http-errors');
const { Milestone } = require('../../../models');

const canUpdateOrCreateMilestones = (req, projectId) => {
  return req.user.dataValues.usersProjects.some(
    el => el.roles.some(
      role => (role.dataValues.projectRoleId === 1 || role.dataValues.projectRoleId === 2)
      && el.dataValues.projectId === projectId
    ));
};

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
    .findByPrimary(req.params.id, { attributes: ['id', 'projectId'] })
    .then((milestone) => {
      if (!milestone) {
        return next(createError(404));
      }
      if (!canUpdateOrCreateMilestones(req, milestone.projectId)) {
        if (!req.user.isGlobalAdmin) {
          return next(createError(403));
        }
      }
    });
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
    .findByPrimary(req.params.id, { attributes: ['id', 'projectId'] })
    .then((milestone) => {
      if (!milestone) {
        return next(createError(404));
      }
      if (!canUpdateOrCreateMilestones(req, milestone.projectId)) {
        if (!req.user.isGlobalAdmin) {
          return next(createError(403));
        }
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
