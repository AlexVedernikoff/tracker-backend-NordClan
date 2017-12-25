const models = require('../../../models');
const queries = require('../../../models/queries');

exports.update = async (req) => {
  let oldTimesheet;
  const params = req.body;

  if (req.isSystemUser) {
    oldTimesheet = await models.Timesheet.findById(params.sheetId);
  } else {
    oldTimesheet = await queries.timesheet.canUserChangeTimesheet(req.user.id, params.sheetId);
  }

  const updatedTimesheet = await models.Timesheet.update(params, {
    where: { id: params.sheetId },
    include: setInclude(),
    returning: true
  });

  const needUpdateTaskTime = params.spentTime && oldTimesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION;
  const updatedTask = needUpdateTaskTime
    ? await getUpdatedTask(updatedTimesheet, oldTimesheet)
    : null;

  return {
    updatedTimesheet: updatedTimesheet[1][0].dataValues,
    updatedTask
  };
};

async function getUpdatedTask (updatedTimesheet, oldTimesheet) {
  const diffTime = updatedTimesheet[1][0].dataValues.spentTime - oldTimesheet.spentTime;
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + ${diffTime}`);
  const updatedTask = await models.Task.update({ factExecutionTime }, {
    where: { id: updatedTimesheet[1][0].dataValues.taskId },
    returning: true
  });

  return {
    id: updatedTask[1][0].dataValues.id,
    projectId: updatedTask[1][0].dataValues.projectId,
    factExecutionTime: updatedTask[1][0].dataValues.factExecutionTime
  };
}

function setInclude () {
  return [
    {
      as: 'task',
      model: models.Task,
      required: false,
      attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
      paranoid: false,
      include: [
        {
          as: 'project',
          model: models.Project,
          required: false,
          attributes: ['id', 'name'],
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
}
