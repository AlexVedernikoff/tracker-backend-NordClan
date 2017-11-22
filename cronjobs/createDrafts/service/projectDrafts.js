const createError = require('http-errors');
const models = require('../../../server/models');

exports.createProjectDrafts = async function (onDate, transaction) {
  try {
    const magicActivities = models.TimesheetTypesDictionary.magicActivities;

    const promises = magicActivities.map(async activityId => {
      const projectUsers = await models.ProjectUsers.findAll({
        attributes: ['id', 'userId', 'projectId'],
        where: models.sequelize.literal('"timesheet"."id" IS NULL'),
        include: [
          {
            as: 'user',
            model: models.User,
            attributes: [],
            required: true,
            where: {
              active: 1
            }
          },
          {
            as: 'project',
            model: models.Project,
            attributes: [],
            required: true,
            where: {
              statusId: models.ProjectStatusesDictionary.IN_PROGRESS
            }
          },
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

      const entities = projectUsers.map(projectUser => ({
        onDate,
        userId: projectUser.dataValues.userId,
        projectId: projectUser.dataValues.projectId,
        typeId: activityId
      }));

      await models.TimesheetDraft.bulkCreate(entities, { transaction });
    });

    await Promise.all(promises);
    console.info('Created drafts project activity!');
  } catch (e) {
    throw createError(e);
  }
};
