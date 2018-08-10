const models = require('../');

exports.name = 'timesheetDraft';

exports.findDraftSheet = async function (userId, id) {
  return await models.TimesheetDraft.findOne({
    required: true,
    where: { id, userId },
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskStatusId', 'userId', 'isVisible', 'taskId', 'projectId'],
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: ['id', 'name', 'plannedExecutionTime', [
          models.sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "TimesheetDraft"."task_id")`), 'factExecutionTime']],
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name', 'prefix'],
            paranoid: false
          },
          {
            as: 'taskStatus',
            model: models.TaskStatusesDictionary,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false
          }
        ]
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      },
      {
        as: 'projectMaginActivity',
        model: models.Project,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      }
    ]
  });
};

exports.getDraftToDestroy = async function (options) {
  const { onDate, typeId, taskId, projectId, taskStatusId, userId } = options;

  const where = {
    onDate,
    userId,
    typeId
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

  const draft = await models.TimesheetDraft
    .findOne({
      where: where,
      attributes: ['id']
    });


  return draft;
};

exports.all = async function (conditions) {
  return await models.TimesheetDraft.findAll({
    where: conditions,
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskStatusId', 'userId', 'isVisible', 'taskId', 'projectId'],
    order: [
      ['createdAt', 'ASC']
    ],
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: ['id', 'name', 'plannedExecutionTime', [
          models.sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "TimesheetDraft"."task_id")`), 'factExecutionTime']],
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name', 'prefix'],
            paranoid: false
          },
          {
            as: 'taskStatus',
            model: models.TaskStatusesDictionary,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false
          },
          {
            as: 'sprint',
            model: models.Sprint,
            required: true,
            attributes: ['name']
          }
        ]
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      },
      {
        as: 'projectMaginActivity',
        model: models.Project,
        required: false,
        attributes: ['id', 'name', 'prefix'],
        paranoid: false
      }
    ]
  });
};

function appendInclude (entities) {
  const links = [
    {
      as: 'task',
      model: models.Task,
      required: false,
      attributes: ['id', 'name', 'plannedExecutionTime', [
        models.sequelize.literal(`(SELECT sum(tsh.spent_time)
        FROM timesheets AS tsh
        WHERE tsh.task_id = "TimesheetDraft"."task_id")`), 'factExecutionTime']],
      paranoid: false,
      include: [
        {
          as: 'project',
          model: models.Project,
          required: false,
          attributes: ['id', 'name', 'prefix'],
          paranoid: false
        },
        {
          as: 'taskStatus',
          model: models.TaskStatusesDictionary,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false
        }
      ]
    },
    {
      as: 'taskStatus',
      model: models.TaskStatusesDictionary,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false
    },
    {
      as: 'projectMaginActivity',
      model: models.Project,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false
    }
  ];

  return entities.map(entity => {
    return links.find(link => link.as === entity);
  });
}

exports.findDraft = async function (where, links = []) {
  const include = appendInclude(links);
  return await models.TimesheetDraft.findOne({
    required: true,
    where,
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskStatusId', 'userId', 'isVisible', 'taskId', 'projectId'],
    include
  });
};
