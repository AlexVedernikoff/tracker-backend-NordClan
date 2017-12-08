const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async function (req, res, next){
  if (!(Number.isInteger(+req.params.projectId) && +req.params.projectId > 0)) {
    return next(createError(400, 'projectId is wrong'));
  }
  if (!(Number.isInteger(+req.body.userId) && +req.body.userId > 0)) {
    return next(createError(400, 'userId is wrong'));
  }

  if (!req.user.canUpdateProject(req.params.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  const rolesIds = parseRolesIds(req.body.rolesIds);
  if (!rolesIds) {
    return next(createError('roleId is invalid, see project roles dictionary'));
  }

  models.ProjectUsers.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  const projectId = req.params.projectId;
  const userId = req.body.userId;

  const options = {
    where: { projectId, userId, deletedAt: null },
    defaults: { rolesIds, projectId, userId }
  };

  models.ProjectUsers
    .findOrCreate(options)
    .spread(async (user, created) => {
      if (!created) {
        await user.updateAttributes({ rolesIds });
      }

      const allProjectUsers = await queries.projectUsers.getUsersByProject(projectId, ['userId', 'rolesIds']);
      res.json(allProjectUsers);
    })
    .catch(e => next(createError(e)));
};

function parseRolesIds (rolesIds) {
  if (rolesIds && parseInt(rolesIds) !== 0) {
    const roles = rolesIds.split(',').map((el) => +el.trim());
    const allowedRolesId = models.ProjectRolesDictionary.values.map((el) => el.id);
    roles.forEach((roleId) => {
      if (!~allowedRolesId.indexOf(roleId)) {
        return null;
      }
    });
    return JSON.stringify(roles);
  }
  return JSON.stringify([]);
}

exports.delete = function (req, res, next){
  if (!req.params.projectId) return next(createError(400, 'projectId need'));
  if (!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if (+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  if (!req.params.userId) return next(createError(400, 'userId need'));
  if (!Number.isInteger(+req.params.userId)) return next(createError(400, 'userId must be int'));
  if (+req.params.userId <= 0) return next(createError(400, 'userId must be > 0'));

  if (!req.user.canUpdateProject(req.params.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  return models.sequelize.transaction(function (t) {
    return models.ProjectUsers
      .findOne({where: {
        projectId: req.params.projectId,
        userId: req.params.userId,
        deletedAt: null
      }, transaction: t, lock: 'UPDATE' })
      .then((projectUser) => {
        if (!projectUser) { return next(createError(404)); }

        return projectUser.destroy({ transaction: t })
          .then(()=>{
            return queries.projectUsers.getUsersByProject(req.params.projectId, ['userId', 'rolesIds'], t)
              .then((users) => {
                res.json(users);
              });
          });
      });
  })
    .catch((err) => {
      next(err);
    });
};


exports.list = function (req, res, next){
  if (!req.params.projectId) return next(createError(400, 'projectId need'));
  if (!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if (+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  queries.projectUsers.getUsersByProject(req.params.projectId)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      next(err);
    });
};
