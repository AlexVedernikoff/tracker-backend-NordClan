const createError = require('http-errors');
const models = require('../../../server/models');
const { createTaskDrafts } = require('./taskDrafts');
const { createProjectDrafts } = require('./projectDrafts');
const { createNoProjectDrafts } = require('./noProjectDrafts');

module.exports = () => {
  return {
    call: async (onDate) => {
      let transaction;
      try {
        transaction = await models.sequelize.transaction();
        await createTaskDrafts(onDate, transaction);
        await createProjectDrafts(onDate, transaction);
        await createNoProjectDrafts(onDate, transaction);
        await transaction.commit();

      } catch (e) {
        transaction.rollback();
        throw createError(e);
      }
    }
  };
};
