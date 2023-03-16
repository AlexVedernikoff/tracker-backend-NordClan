const models = require('../../../models');
const createError = require('http-errors');
const queries = require('../../../models/queries');

exports.update = async (req) => {
  const { sheetId } = req.body;
  const { globalRole, id: userId } = req.user;

  const canChangeAnyTimesheetRoles = ["ADMIN", "VISOR"];
  const canChangeAnyTimesheet = canChangeAnyTimesheetRoles.includes(globalRole);

  const existedTimesheet = await queries.timesheet.getTimesheet({id: {$eq: sheetId}});

  if (existedTimesheet.dataValues.userId !== userId && !canChangeAnyTimesheet) {
    throw createError(403, "You are not the timesheet owner!");
  }

  const updatedTimesheet = await models.Timesheet.update(req.body, {
    where: getWhere(req, canChangeAnyTimesheet),
    include: getInclude(),
    returning: true,
    userId: req.user.id,
  });

  if (!updatedTimesheet[1][0]) {
    throw createError(404);
  }

  return updatedTimesheet[1][0].dataValues;
};

function getWhere (req, canChangeAnyTimesheet) {
  const where = {
    id: req.body.sheetId,
  };

  const userId = req.body.userId || req.user.id;

  if (!req.isSystemUser && !canChangeAnyTimesheet) {
    where.userId = userId;
  }
  return where;
}

function getInclude () {
  return [
    {
      as: 'task',
      model: models.Task,
      required: false,
      attributes: ['id', 'name', 'plannedExecutionTime', [
        models.sequelize.literal(`(SELECT sum(tsh.spent_time)
        FROM timesheets AS tsh
        WHERE tsh.task_id = "Timesheet"."task_id")`), 'factExecutionTime']],
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
      as: 'projectMaginActivity',
      model: models.Project,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false,
    },
  ];
}
