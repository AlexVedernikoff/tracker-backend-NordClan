const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheet';

// проверка является ли исполнителем указанный пользователь
// проверка на статус таймшита
exports.canUserChangeTimesheet = function (userId, timesheetId) {
  return models.Timesheet
    .findOne({
      where: {
        id: timesheetId,
        userId: userId,
        statusId: models.TimesheetStatusesDictionary.NON_BLOCKED_IDS,
      },
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskId', 'statusId', 'spentTime', 'sprintId'],
    })
    .then((model) => {
      if (!model) {
        throw createError(403, 'User can\'t change timesheet');
      }
      return model;
    });
};

exports.getTimesheet = async function (params) {
  const timesheet = await models.Timesheet.findOne({
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'isVisible', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'sprintId'],
    where: params,
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: {
          include: [[models.sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "Timesheet"."task_id")`), 'factExecutionTime']],
        },
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name', 'prefix'],
            paranoid: false,
          },
          {
            as: 'sprint',
            model: models.Sprint,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false,
          },
          {
            as: 'taskStatus',
            model: models.TaskStatusesDictionary,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false,
          },
        ],
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
      {
        as: 'project',
        model: models.Project,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
      {
        as: 'sprint',
        model: models.Sprint,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
    ],
  }).then((model) => {
    if (!model) {
      return createError('User can\'t change timesheet');
    }

    if (model.dataValues.task && model.dataValues.task.dataValues.project) {
      model.dataValues.project = model.dataValues.task.dataValues.project;
      delete model.dataValues.task.dataValues.project;
    }

    return model;
  });
  return timesheet;
};

exports.getTimesheetByParams = async function (options) {
  const { onDate, typeId, taskId, projectId, taskStatusId, userId, sprintId } = options;

  const where = {
    onDate,
    userId,
    typeId,
    sprintId,
  };

  if (taskId) {
    where.taskId = taskId;
  } else if (projectId) {
    where.projectId = projectId;
  } else {
    where.projectId = { $eq: null }; // IS NULL
  }

  if (taskStatusId) {
    where.taskStatusId = taskStatusId;
  }

  return models.Timesheet.findOne({ where: where, attributes: ['id'] });
};

exports.isBillableFlag = async function (options) {
  const {userId, projectId, taskId} = options;
  const projectUsers = await models.ProjectUsers.findOne({
    where: {
      projectId: projectId,
      userId: userId,
    },
    attributes: ['rolesIds'],
    include: [/** обязательно для формирования виртуального свойства roleIds*/
      {
        as: 'roles',
        model: models.ProjectUsersRoles,
      },
    ],
  });
  if (!projectUsers) {
    const user = await models.User.findOne({
      where: {
        id: userId,
      },
    });
    if (user && user.dataValues.globalRole === 'DEV_OPS') {
      const task = await models.Task
        .findOne({
          where: {
            deletedAt: null,
            id: taskId,
          },
        });
      if (task && task.dataValues.isDevOps) return false;
      else return true;
    }
    return true;
  }

  /** Получаем список ролей для заполнения метрик*/
  const rolesIds = projectUsers.get().rolesIds;/** виртуальное свойство в виде стрингифаеного массива*/
  return isBillable(JSON.parse(rolesIds), models.ProjectRolesDictionary.UNBILLABLE_ID);
};

function isBillable (rolesIds, UNBILLABLE_ID) {
  if (rolesIds && rolesIds.length) {
    return !rolesIds.find(id => id === UNBILLABLE_ID);
  }
  return true;
}

exports.all = async function (conditions) {
  return await models.Timesheet.findAll({
    where: conditions,
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId'],
    order: [
      ['createdAt', 'ASC'],
    ],
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: {
          include: [[models.sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "Timesheet"."task_id")`), 'factExecutionTime']],
        },
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name', 'prefix'],
            paranoid: false,
          },
          {
            as: 'sprint',
            model: models.Sprint,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false,
          },
          {
            as: 'taskStatus',
            model: models.TaskStatusesDictionary,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false,
          },
        ],
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
      {
        as: 'user',
        model: models.User,
        required: false,
        attributes: ['id', 'fullNameRu', 'fullNameEn', 'emailPrimary', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn'],
        paranoid: false,
      },
      {
        as: 'sprint',
        model: models.Sprint,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
      {
        as: 'projectMaginActivity',
        model: models.Project,
        required: false,
        attributes: ['id', 'name', 'prefix'],
        paranoid: false,
      },
    ],
  });
};

exports.findOne = function (where) {
  return models.Timesheet
    .findOne({
      required: true,
      where,
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'isVisible'],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: false,
          attributes: {
            include: [[models.sequelize.literal(`(SELECT sum(tsh.spent_time)
            FROM timesheets AS tsh
            WHERE tsh.task_id = "Timesheet"."task_id")`), 'factExecutionTime']],
          },
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: false,
              attributes: ['id', 'name', 'prefix'],
              paranoid: false,
            },
          ],
        },
        {
          as: 'project',
          model: models.Project,
          required: false,
          attributes: ['id', 'name', 'prefix'],
          paranoid: false,
        },
      ],
    })
    .then((model) => {
      if (!model) {
        return createError('User can\'t change timesheet');
      }

      if (model.dataValues.task && model.dataValues.task.dataValues.project) {
        model.dataValues.project = model.dataValues.task.dataValues.project;
        delete model.dataValues.task.dataValues.project;
      }
      return model;
    });
};
