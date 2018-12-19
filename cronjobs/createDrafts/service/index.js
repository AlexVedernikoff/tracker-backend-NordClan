const createError = require('http-errors');
const models = require('../../../server/models');
const request = require('./request');

module.exports = () => {
  function getEntities (onDate, tasks, timesheetTypeImplementation) {
    return tasks.map(task => ({
      onDate,
      userId: task.performerId,
      typeId: timesheetTypeImplementation.id,
      taskId: task.id,
      taskStatusId: task.statusId,
      isVisible: true
    }));
  }

  return {
    call: async (onDate) => {
      let transaction;
      try {
        transaction = await models.sequelize.transaction();
        const timesheetTypeImplementation = await models.TimesheetTypesDictionary.findOne({
          codeName: 'IMPLEMENTATION'
        });
        const tasks = await models.Task.findAll(request(onDate, timesheetTypeImplementation));
        const entities = getEntities(onDate, tasks, timesheetTypeImplementation);
        await models.TimesheetDraft.bulkCreate(entities, { transaction });
        await transaction.commit();
      } catch (e) {
        if (transaction) {
          await transaction.rollback();
        }
        throw createError(e);
      }
    }
  };
};
