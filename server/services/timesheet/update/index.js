const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

exports.update = async (params) => {
  const timesheet = await models.Timesheet.update(params, { where: { id: params.sheetId } });
  const transaction = await Sequelize.transaction();

  try {
    if (params.spentTime && timesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const task = await queries.task.findOneActiveTask(timesheet.taskId, ['id', 'factExecutionTime'], transaction);
      const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + (${params.spentTime} - ${timesheet.spentTime})`);
      await models.Task.update({ factExecutionTime }, { where: { id: task.id }, transaction: transaction });
    }

    await transaction.commit();
    return await queries.timesheet.getTimesheet(timesheet.id);
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};
