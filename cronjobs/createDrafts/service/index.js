const createError = require('http-errors');
const models = require('../../../server/models');
const request = require('./request');

module.exports = () => {
  function getEntities (onDate, tasks) {
    return tasks.map(task => ({
      onDate,
      userId: task.performerId,
      typeId: models.TimesheetTypesDictionary.IMPLEMENTATION
    }));
  }

  return {
    call: async (onDate) => {
      let transaction;
      try {
        const tasks = await models.Task.findAll(request(onDate));
        const entities = getEntities(onDate, tasks);
        transaction = await models.sequelize.transaction();
        await models.TimesheetDraft.bulkCreate(entities, { transaction });
        await transaction.commit();
      } catch (e) {
        transaction.rollback();
        throw createError(e);
      }
    }
  };
};
