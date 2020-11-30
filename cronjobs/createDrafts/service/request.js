const models = require('../../../server/models');

module.exports = (onDate, timesheetTypeImplementation) => ({
  attributes: ['id', 'performerId', 'statusId'],
  where: {
    statusId: models.TaskStatusesDictionary.CAN_CREATE_DRAFT_BY_CRON, // Только для активных тасок
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
            userId: models.sequelize.literal('"project.projectUsers"."user_id" = "Task"."performer_id"') // Только для пользователя который состоит в проекте
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
        typeId: timesheetTypeImplementation.id,
        userId: models.sequelize.literal('"timesheet"."user_id" = "Task"."performer_id"') // Только для пользователя который состоит в проекте
      }
    }
  ]
});
