const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');
const _ = require('underscore');

exports.create = async function (req, res, next){
  try {
    if (!(Number.isInteger(+req.params.projectId) && +req.params.projectId > 0)) {
      return next(createError(400, 'projectId is wrong'));
    }
    if (!(Number.isInteger(+req.body.userId) && +req.body.userId > 0)) {
      return next(createError(400, 'userId is wrong'));
    }

    if (!req.user.canUpdateProject(req.params.projectId)) {
      return next(createError(403, 'Access denied'));
    }

    const rolesIds = await parseRolesIds(req.body.rolesIds);
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
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
        // {
        //   as: 'user',
        //   model: models.User,
        //   attributes: ['globalRole']
        // }
      ],
      defaults: { projectId, userId }
    };

    models.ProjectUsers
      .findOrCreate(options)
      .spread(async (user, created) => {

        // if (user && user.dataValues.user &&
        //   (user.dataValues.user.dataValues.globalRole !== models.User.EXTERNAL_USER_ROLE && rolesIds.indexOf(models.ProjectRolesDictionary.CUSTOMER_ID) !== -1)
        //   || (user.dataValues.user.dataValues.globalRole === models.User.EXTERNAL_USER_ROLE
        //     && (rolesIds.length > 1 || rolesIds.indexOf(models.ProjectRolesDictionary.CUSTOMER_ID) === -1)
        //   )
        // ) {
        //   return next(createError(403, 'roleId is invalid for this userId'));
        // }

        if (rolesIds.length > 0) {
          const deleteRoles = [];
          const createRoles = [];

          const roles = await models.ProjectRolesDictionary.findAll({
            attributes: ['id']
          });
          roles.forEach((projectRole) => {
            if (rolesIds.indexOf(projectRole.id) === -1) {
              deleteRoles.push(projectRole.id);
            } else if (!_.find(user.roles, { projectRoleId: projectRole.id })) {
              createRoles.push({
                projectUserId: user.id,
                projectRoleId: projectRole.id
              });
            }
          });

          if (deleteRoles.length > 0) {
            await models.sequelize.transaction(function (t){
              return models.ProjectUsersRoles.destroy({
                where: {
                  projectUserId: user.id,
                  projectRoleId: {
                    '$in': deleteRoles
                  }
                },
                transaction: t
              });
            });
          }

          if (createRoles.length > 0) {
            await models.sequelize.transaction(function (t){
              return models.ProjectUsersRoles.bulkCreate(createRoles, {transaction: t});
            });
          }
        }

        if (created) {
          const projectEvents = await models.ProjectEventsDictionary.findAll({
            attributes: ['id']
          });
          const projectUsersSubscriptionsData = projectEvents.map((projectEvent) => {
            return {
              projectUserId: user.id,
              projectEventId: projectEvent.id
            };
          });
          await models.sequelize.transaction(function (t){
            return models.ProjectUsersSubscriptions.bulkCreate(projectUsersSubscriptionsData, {transaction: t});
          });
        }

        const allProjectUsers = await queries.projectUsers.getUsersByProject(projectId, false, ['userId', 'rolesIds']);
        res.json(allProjectUsers);
      })
      .catch(e => next(createError(e)));
  } catch (error) {
    throw error;
  }
};

async function parseRolesIds (rolesIds) {
  try {
    if (rolesIds && parseInt(rolesIds) !== 0) {
      const roles = rolesIds.split(',').map((el) => +el.trim());
      const allowedRoles = await models.ProjectRolesDictionary.findAll({
        attributes: ['id']
      });
      const allowedRolesId = allowedRoles.map((el) => el.id);
      roles.forEach((roleId) => {
        if (!~allowedRolesId.indexOf(roleId)) {
          return null;
        }
      });
      return roles;
    }
    return [];
  } catch (error) {
    throw error;
  }
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

  return models.sequelize.transaction(async function (t) {
    const projectUser = await models.ProjectUsers
      .findOne({
        where: {
          projectId: req.params.projectId,
          userId: req.params.userId,
          deletedAt: null
        },
        transaction: t,
        lock: 'UPDATE'
      });

    if (!projectUser) {
      return next(createError(404));
    }

    await models.ProjectUsersSubscriptions.destroy({
      where: {
        projectUserId: projectUser.id
      },
      transaction: t
    });

    await models.ProjectUsersRoles.destroy({
      where: {
        projectUserId: projectUser.id
      },
      transaction: t
    });

    await projectUser.destroy({ transaction: t, historyAuthorId: req.user.id });

    const isExternal = +req.query.isExternal === 1;

    const users = await queries.projectUsers.getUsersByProject(req.params.projectId, isExternal, ['userId', 'rolesIds'], t);
    res.json(users);
  })
    .catch((err) => {
      next(err);
    });
};


exports.list = function (req, res, next){
  if (!req.params.projectId) return next(createError(400, 'projectId need'));
  if (!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if (+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  const isExternal = +req.query.isExternal === 1;

  queries.projectUsers.getUsersByProject(req.params.projectId, isExternal)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      next(err);
    });
};
