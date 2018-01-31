const models = require('../../../models');
const createError = require('http-errors');

exports.update = async (req) => {


  const updatedTimesheet = await models.Timesheet.update(req.body, {
    where: getWhere(req),
    include: getInclude(),
    returning: true
  });

  if (!updatedTimesheet[1][0]) {
    throw createError(404);
  }

  return updatedTimesheet[1];
};

function getWhere (req) {
  const where = {
    id: req.body.sheetId
  };

  if (!req.isSystemUser) {
    where.userId = req.user.id;
  }

  return where;
}

function getInclude () {
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
