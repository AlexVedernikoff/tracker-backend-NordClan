const createError = require('http-errors');
const models = require('../../../models');
const queries = require('../../../models/queries');
const gitLabService = require('../../../services/gitLab');
const _ = require('underscore');
require('request').debug = true;

exports.create = async function (req, res, next){
  let transaction;
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

    const gitlabRoles = req.body.gitlabRoles;
    if (!models.GitlabUserRoles.isRolesValid(gitlabRoles)) {
      return next(createError(400, 'gitlabRoles is invalid, see gitlab api'));
    }

    models.ProjectUsers.beforeValidate((model) => {
      model.authorId = req.user.id;
    });

    const projectId = req.params.projectId;
    const userId = req.body.userId;

    transaction = await models.sequelize.transaction();
    const options = {
      where: { projectId, userId, deletedAt: null },
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      defaults: { projectId, userId },
      transaction
    };

    models.ProjectUsers
      .findOrCreate(options)
      .spread(async (projectUser, created) => {

        if (rolesIds.length > 0) {
          const deleteRoles = [];
          const createRoles = [];

          const roles = await models.ProjectRolesDictionary.findAll({
            attributes: ['id'],
            transaction
          });
          roles.forEach((projectRole) => {
            if (rolesIds.indexOf(projectRole.id) === -1) {
              deleteRoles.push(projectRole.id);
            } else if (!_.find(projectUser.roles, { projectRoleId: projectRole.id })) {
              createRoles.push({
                projectUserId: projectUser.id,
                projectRoleId: projectRole.id
              });
            }
          });

          if (deleteRoles.length > 0) {
            await models.ProjectUsersRoles.destroy({
              where: {
                projectUserId: projectUser.id,
                projectRoleId: {
                  '$in': deleteRoles
                }
              },
              transaction
            });
          }

          if (createRoles.length > 0) {
            await models.ProjectUsersRoles.bulkCreate(createRoles, { transaction });
          }
        }

        if (gitlabRoles.length) {
          await gitLabService.projects.processGitlabRoles(gitlabRoles, projectUser, transaction);
        }

        if (created) {
          const projectEvents = await models.ProjectEventsDictionary.findAll({
            attributes: ['id'],
            transaction
          });
          const projectUsersSubscriptionsData = projectEvents.map((projectEvent) => {
            return {
              projectUserId: projectUser.id,
              projectEventId: projectEvent.id
            };
          });
          await models.ProjectUsersSubscriptions.bulkCreate(projectUsersSubscriptionsData, { transaction });
        }

        await transaction.commit();
        const allProjectUsers = await queries.projectUsers.getUsersByProject(projectId, false, ['userId', 'rolesIds']);
        res.json(allProjectUsers);
      });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
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

exports.delete = async function (req, res, next){
  if (!req.params.projectId) return next(createError(400, 'projectId need'));
  if (!Number.isInteger(+req.params.projectId)) return next(createError(400, 'projectId must be int'));
  if (+req.params.projectId <= 0) return next(createError(400, 'projectId must be > 0'));

  if (!req.params.userId) return next(createError(400, 'userId need'));
  if (!Number.isInteger(+req.params.userId)) return next(createError(400, 'userId must be int'));
  if (+req.params.userId <= 0) return next(createError(400, 'userId must be > 0'));

  if (!req.user.canUpdateProject(req.params.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  let transaction;
  try {
    transaction = await models.sequelize.transaction();
    const projectUser = await models.ProjectUsers
      .findOne({
        where: {
          projectId: req.params.projectId,
          userId: req.params.userId,
          deletedAt: null
        },
        transaction,
        lock: 'UPDATE'
      });

    if (!projectUser) {
      await transaction.rollback();
      return next(createError(404));
    }

    await models.ProjectUsersSubscriptions.destroy({
      where: {
        projectUserId: projectUser.id
      },
      transaction
    });

    await models.ProjectUsersRoles.destroy({
      where: {
        projectUserId: projectUser.id
      },
      transaction
    });

    const gitlabUserRoles = await models.GitlabUserRoles.findAll({
      where: {
        projectUserId: projectUser.id
      },
      transaction
    });

    if (gitlabUserRoles.length) {
      const user = await models.User.findOne({
        where: {
          id: projectUser.userId
        },
        transaction
      });
      for (let i = 0; i < gitlabUserRoles.length; i++) {
        const { gitlabProjectId } = gitlabUserRoles[i];
        await gitLabService.projects.removeProjectMember(gitlabProjectId, user.gitlabUserId);
      }

      await models.GitlabUserRoles.destroy({
        where: {
          projectUserId: projectUser.id
        },
        transaction
      });
    }

    await projectUser.destroy({ transaction, historyAuthorId: req.user.id });

    const isExternal = +req.query.isExternal === 1;

    const users = await queries.projectUsers.getUsersByProject(req.params.projectId, isExternal, ['userId', 'rolesIds'], transaction);
    await transaction.commit();
    res.json(users);
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
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
