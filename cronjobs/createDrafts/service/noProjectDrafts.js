const createError = require('http-errors');
const models = require('../../../server/models');

exports.createNoProjectDrafts = async function (onDate, transaction) {
  try {
    const magicActivities = models.TimesheetTypesDictionary.magicActivities;

    const promises = magicActivities.map(async activityId => {
      const users = await models.User.findAll({
        attributes: ['id'],
        where: models.sequelize.literal('"User"."active" = 1 AND "timesheet"."id" IS NULL'),
        include: [
          {
            as: 'timesheet',
            model: models.Timesheet,
            attributes: ['id'],
            required: false,
            where: {
              onDate: onDate,
              typeId: activityId
            }
          }
        ]
      });

      const entities = users.map(user => ({
        onDate,
        userId: user.dataValues.id,
        typeId: activityId
      }));

      await models.TimesheetDraft.bulkCreate(entities, { transaction });
    });

    await Promise.all(promises);
    console.info('Created drafts no project activity!');
  } catch (e) {
    throw createError(e);
  }
};
