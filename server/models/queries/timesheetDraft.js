const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheetDraft';


/**
 * Поиск драфтшита по id
 */
exports.findDraftSheet = async function (userId, draftsheetId) {
  const draftsheetModel = await models.TimesheetDraft.findOne({
    required: true,
    where: {
      id: draftsheetId,
      userId: userId
    },
    attributes: ['id', 'typeId', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'statusId', 'comment', 'isVisible']
  });
  if (!draftsheetModel) throw createError(404, 'User can\'t change draftsheet!');
  return draftsheetModel;
};

exports.all = async function (conditions) {
  return await models.TimesheetDraft.findAll({
    where: conditions,
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId', 'projectId'],
    order: [
      ['createdAt', 'ASC']
    ],
    include: [
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
    ]
  });
}
