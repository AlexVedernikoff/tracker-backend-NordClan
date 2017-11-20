const createError = require('http-errors');
const models = require('../../../server/models');

module.exports = () => {
  async function createTaskDrafts (onDate, transaction) {
    const tasks = await models.Task.findAll({
      attributes: ['id', 'performerId'],
      where: {
        statusId: models.TaskStatusesDictionary.CAN_UPDATE_TIMESHEETS_STATUSES,
        sprintId: {
          not: null
        },
        performerId: {
          not: null
        },
        id: models.sequelize.literal('"timesheet"."id" IS NULL')
      },
      include: [
        {
          as: 'project',
          model: models.Project,
          required: true,
          attributes: [],
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
            typeId: models.TimesheetTypesDictionary.IMPLEMENTATION
          }
        }
      ]
    });

    const entities = tasks.map(task => ({
      onDate,
      userId: task.performerId,
      typeId: models.TimesheetTypesDictionary.IMPLEMENTATION
    }));

    await models.TimesheetDraft.bulkCreate(entities, { transaction });
  }

  async function createProjectDrafts (onDate, transaction) {
    try {
      const magicActivities = models.TimesheetTypesDictionary.magicActivities;
      await magicActivities.map(async activityId => {
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

      console.info('Created drafts project activity!');
    } catch (e) {
      throw createError(e);
    }
  }

  async function createNoProjectDrafts (onDate, transaction) {
    try {
      const magicActivities = models.TimesheetTypesDictionary.magicActivities;
      await magicActivities.map(async activityId => {

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

      console.info('Created drafts no project activity!');
    } catch (e) {
      throw createError(e);
    }
  }

  return {
    call: async (onDate) => {
      let transaction;
      try {
        transaction = await models.sequelize.transaction();
        await createTaskDrafts(onDate, transaction);
        //await createProjectDrafts(onDate, transaction);
        //await createNoProjectDrafts(onDate, transaction);
        await transaction.commit();
      } catch (e) {
        transaction.rollback();
        throw createError(e);
      }
    }
  };
};
