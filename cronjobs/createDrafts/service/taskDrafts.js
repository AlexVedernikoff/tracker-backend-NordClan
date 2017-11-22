const createError = require('http-errors');
const models = require('../../../server/models');

exports.createTaskDrafts = async function (onDate, transaction) {
  try {
    const tasks = await models.Task.findAll({
      attributes: ['id', 'performerId'],
      where: {
        statusId: models.TaskStatusesDictionary.CAN_UPDATE_TIMESHEETS_STATUSES, // Только для активных тасок
        sprintId: {
          not: null
        },
        performerId: {
          not: null
        },
        id: models.sequelize.literal('"timesheet"."id" IS NULL') // Исключаем из выборки таски для которых уже есть таймшиты
      },
      include: [
        {
          as: 'project',
          model: models.Project,
          required: true,
          attributes: [],
          where: {
            statusId: models.ProjectStatusesDictionary.IN_PROGRESS // Только для активных проектов
          },
          include: [
            {
              model: models.ProjectUsers,
              required: true,
              attributes: [],
              where: {
                userId: models.sequelize.literal('"project.ProjectUser"."user_id" = "Task"."performer_id"') // Только для пользователя который состоит в проекте
              }
            }
          ]
        },
        {
          as: 'performer',
          model: models.User,
          required: true,
          attributes: [],
          where: {
            active: 1 // Активные пользователи
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
  } catch (e) {
    throw createError(e);
  }
};
