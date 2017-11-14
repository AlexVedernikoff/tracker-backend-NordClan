
/*
* При создании тайм шита вставляем в запись недостающие данные
* */

exports.index = async (instance, options) => {
  const models = instance.$modelOptions.sequelize.models;
  const t = options.transaction;


  if (isMagicActivityNoProject(instance)) {
    instance.isBillible = false;

  } else if (isMagicActivityWithProject(instance)) {
    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: instance.projectId
      },
      attributes: ['id', 'rolesIds'],
      transaction: t
    });
    instance.isBillible = isBillible(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);
    instance.userRoleId = getRoles(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);

  } else if (isImplementation(instance)) {
    const task = await models.Task.findById(instance.taskId, {
      attributes: ['id', 'projectId'],
      transaction: t
    });

    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: task.projectId
      },
      attributes: ['id', 'rolesIds'],
      transaction: t
    });
    instance.isBillible = isBillible(projectUsers, models.ProjectRolesDictionary.UNBILLABLE_ID);
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


function isBillible (projectUsers, UNBILLABLE_ID) {
  if (projectUsers) {
    return !~projectUsers.rolesIds.indexOf(UNBILLABLE_ID);
  }
  return true;
}

function getRoles (projectUsers, UNBILLABLE_ID) {
  if (projectUsers) {
    const roles = JSON.parse(projectUsers.rolesIds);
    const index = roles.indexOf(UNBILLABLE_ID);
    if (index > -1) roles.splice(index, 1);
    return JSON.stringify(roles);
  }
  return null;
}
