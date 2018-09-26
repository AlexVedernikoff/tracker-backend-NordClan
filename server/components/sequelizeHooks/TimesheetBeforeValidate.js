
/*
* При создании таймшита вставляем в запись недостающие данные
* */

exports.index = async (instance, options) => {
  const models = instance.$modelOptions.sequelize.models;
  const t = options.transaction;
  /** Активность вне проекта, например больничный*/
  if (isMagicActivityNoProject(instance)) {
    instance.isBillable = false;
    return;
  }

  const userId = instance.userId || options.userId;

  /** Активность проекта, например совещание*/
  if (isMagicActivityWithProject(instance)) {
    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: instance.projectId,
        userId: userId
      },
      attributes: ['rolesIds'],
      include: [/** обязательно для формирования виртуального свойства roleIds*/
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      transaction: t
    });
    /** Получаем список ролей для заполнения метрик*/
    const rolesIds = projectUsers.get().rolesIds;/** виртуальное свойство в виде стрингифаеного массива*/
    instance.isBillable = isBillable(JSON.parse(rolesIds), models.ProjectRolesDictionary.UNBILLABLE_ID);
    instance.userRoleId = rolesIds;/** сохраняем для метрик*/
    return;
  }

  /** Конкретный таск конкретного проекта*/
  if (isImplementation(instance)) {
    const task = await models.Task.findById(instance.taskId, {
      attributes: ['id', 'projectId'],
      transaction: t
    });

    const projectUsers = await models.ProjectUsers.findOne({
      where: {
        projectId: task.projectId,
        userId: userId
      },
      attributes: ['rolesIds'],
      include: [/** обязательно для формирования виртуального свойства roleIds*/
        {
          as: 'roles',
          model: models.ProjectUsersRoles
        }
      ],
      transaction: t
    });
    /** Получаем список ролей для заполнения метрик*/
    const rolesIds = projectUsers.get().rolesIds;/** виртуальное свойство в виде стрингифаеного массива*/
    instance.isBillable = isBillable(JSON.parse(rolesIds), models.ProjectRolesDictionary.UNBILLABLE_ID);
    instance.userRoleId = rolesIds;/** сохраняем для метрик*/
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


function isBillable (rolesIds, UNBILLABLE_ID) {
  if (rolesIds && rolesIds.length) {
    return !rolesIds.find(id => id === UNBILLABLE_ID);
  }
  return true;
}

