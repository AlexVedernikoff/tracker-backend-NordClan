const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');

//TODO рефакторинг - подумать над транзакциями
exports.update = async (params) => {
  await models.Timesheet.update(params, { where: { id: params.sheetId } });
  const timesheet = await queries.timesheet.getTimesheet({ id: params.sheetId });

  const transaction = await Sequelize.transaction();

  try {
    if (params.spentTime && timesheet.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const factExecutionTime = models.sequelize.literal(`"fact_execution_time" + (${params.spentTime} - ${timesheet.spentTime})`);
      await models.Task.update({ factExecutionTime }, { where: { id: timesheet.task.id }, transaction });
    }

    await transaction.commit();
    return timesheet;
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};
