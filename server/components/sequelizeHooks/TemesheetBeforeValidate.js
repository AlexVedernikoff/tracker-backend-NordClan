
/*
* При создании тайм шита вставляем в запись недостающие данные
* */

const _ = require('underscore');

exports.index = async (instance, options) => {
  const models = instance.$modelOptions.sequelize.models;
  const t = options.transaction;


  if (isMagicActivityNoProject(instance)) {
    instance.isBillable = false;

  } else if (isMagicActivityWithProject(instance)) {
    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: instance.projectId,
        userId: instance.userId
      },
      attributes: ['id'],
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      transaction: t
    });
    instance.isBillable = isBillable(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);
    instance.userRoleId = getRoles(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);

  } else if (isImplementation(instance)) {
    const task = await models.Task.findById(instance.taskId, {
      attributes: ['id', 'projectId'],
      transaction: t
    });

    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: task.projectId,
        userId: instance.userId
      },
      attributes: ['id'],
      include: [
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      transaction: t
    });
    instance.isBillable = isBillable(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);
    instance.userRoleId = getRoles(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);

  }

};

function isMagicActivityNoProject (instance) {
  return !instance.projectId && !instance.taskId;
}

function isMagicActivityWithProject (instance) {
  return instance.projectId && !instance.taskId;
}

function isImplementation (instance) {
  return instance.taskId;
}


function isBillable (projectUsers, UNBILLABLE_ID) {
  if (projectUsers && projectUsers.roles) {
    return !_.find(projectUsers.roles, { projectRoleId: UNBILLABLE_ID });
  }
  return true;
}

function getRoles (projectUsers, UNBILLABLE_ID) {
  if (projectUsers && projectUsers.roles) {
    const roles = projectUsers.roles.map((role) => role.projectRoleId);
    const index = roles.indexOf(UNBILLABLE_ID);
    if (index > -1) roles.splice(index, 1);
    return JSON.stringify(roles);
  }
  return null;
}
