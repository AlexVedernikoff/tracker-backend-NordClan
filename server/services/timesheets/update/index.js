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

  return updatedTimesheet[1][0].dataValues;
};

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
}
