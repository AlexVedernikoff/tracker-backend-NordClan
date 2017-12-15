const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const { Timesheet, TimesheetDraft } = models;
const queries = require('../../../models/queries');

exports.updateDraft = async function (params, draftId) {
  const createdTimesheet = await createTimesheet(params, draftId);
  return createdTimesheet;
};

async function createTimesheet (params, draftId) {
  const transaction = await Sequelize.transaction();

  const draft = await TimesheetDraft.findById(draftId);
  updateTaskTime(draft, params, transaction);

  const { onDate, typeId, taskStatusId, userId, taskId } = draft.dataValues;

  const timesheetParams = {
    onDate,
    typeId,
    taskStatusId,
    userId,
    taskId,
    spentTime: params.spentTime
  };

  await models.Timesheet.create(timesheetParams, { transaction });
  await models.TimesheetDraft.destroy({ where: { id: draft.id }, transaction });

  await transaction.commit();

  const timesheet = await Timesheet.findOne({
    where: timesheetParams,
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
          }
        ]
      },
      {
        as: 'project',
        model: models.Project,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      }
    ]
  });

  return timesheet;
}

async function updateTaskTime (draft, params, transaction) {
  const task = await queries.task.findOneActiveTask(draft.taskId, ['id', 'factExecutionTime'], transaction);
  const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + ${params.spentTime}`);
  await models.Task.update({ factExecutionTime }, { where: { id: task.dataValues.id }, transaction });
}
