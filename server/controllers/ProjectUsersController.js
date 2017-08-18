const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  if(!req.params.projectId) return next(createError(400, 'projectId need'));
  if(!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if(+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  if(!req.body.userId) return next(createError(400, 'userId need'));
  if(!Number.isInteger(+req.body.userId)) return next(createError(400, 'userId must be int'));
  if(+req.body.userId <= 0) return next(createError(400, 'userId must be > 0'));

  let rolesIds;
  let allowedRolesId;
  
  if(req.body.rolesIds && +req.body.rolesIds === 0) {
    rolesIds = JSON.stringify([]);
  
  } else if(req.body.rolesIds) {
    rolesIds = req.body.rolesIds.split(',').map((el) => +el.trim());
    allowedRolesId = models.ProjectRolesDictionary.values.map((el) => el.id);

    rolesIds.forEach((roleId) => {
      if(allowedRolesId.indexOf(+roleId) === -1) {
        throw createError(400, 'roleId is invalid, see project roles dictionary');
      }
    });
    rolesIds = JSON.stringify(_.uniq(rolesIds));
  }

  models.ProjectUsers.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Promise.all([
    queries.user.findOneActiveUser(req.body.userId),
    queries.project.findOneActiveProject(req.params.projectId)
  ])
    .then(() => {

      return models.sequelize.transaction(function (t) {
        return models.ProjectUsers
          .findOrCreate({where: {
            projectId: req.params.projectId,
            userId: req.body.userId,
            deletedAt: null
          }, transaction: t, lock: 'UPDATE'})
          .spread((projectUser) => {
            return Promise.resolve()
              .then(() => {
                if(rolesIds) {
                  return projectUser.updateAttributes({rolesIds: rolesIds}, { transaction: t });
                }
              })
              .then(() => {
                return queries.projectUsers.getUsersByProject(req.params.projectId)
                  .then((users) => {
                    res.json(users);
                  });
              });
          });
      });

    })
    .catch((err) => {
      next(err);
    });
};


exports.delete = function(req, res, next){
  if(!req.params.projectId) return next(createError(400, 'projectId need'));
  if(!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if(+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  if(!req.params.userId) return next(createError(400, 'userId need'));
  if(!Number.isInteger(+req.params.userId)) return next(createError(400, 'userId must be int'));
  if(+req.params.userId <= 0) return next(createError(400, 'userId must be > 0'));

  models.ProjectUsers
    .findOne({where: {
      projectId: req.params.projectId,
      userId: req.params.userId,
      deletedAt: null
    } })
    .then((projectUser) => {
      if(!projectUser) { return next(createError(404)); }

      return projectUser.destroy()
        .then(()=>{
          return queries.projectUsers.getUsersByProject(req.params.projectId)
            .then((users) => {
              res.json(users);
            });
        });
    })
    .catch((err) => {
      next(err);
    });
};


exports.list = function(req, res, next){
  if(!req.params.projectId) return next(createError(400, 'projectId need'));
  if(!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if(+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  queries.projectUsers.getUsersByProject(req.params.projectId)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      next(err);
    });
};