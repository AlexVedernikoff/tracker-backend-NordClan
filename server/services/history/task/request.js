const Sequelize = require('sequelize');
const models = require('../../../models');

exports.getRequest = function(taskId, pageSize, currentPage) {
  return {
    where: { taskId: taskId },
    limit: pageSize,
    offset: currentPage > 0 ? + pageSize * (+currentPage - 1) : 0,
    order: [['createdAt', 'DESC']],
    include: additionalEntities()
  };
};

function additionalEntities() {
  return [
    {
      as: 'parentTask',
      model: models.Task,
      where: Sequelize.literal('"ModelHistory"."field" = \'parentId\'' ),
      attributes: ['id','name', 'deletedAt'],
      required: false,
      paranoid: false,
    },
    {
      as: 'prevParentTask',
      model: models.Task,
      where: Sequelize.literal('"ModelHistory"."field" = \'parentId\'' ),
      attributes: ['id','name', 'deletedAt'],
      required: false,
      paranoid: false,
    },
    {
      as: 'sprint',
      model: models.Sprint,
      where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
      attributes: ['id', 'name', 'deletedAt'],
      required: false,
      paranoid: false,
    },
    {
      as: 'prevSprint',
      model: models.Sprint,
      where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
      attributes: ['id', 'name', 'deletedAt'],
      required: false,
      paranoid: false,
    },
    {
      as: 'performer',
      model: models.User,
      where: Sequelize.literal('"ModelHistory"."field" = \'performerId\'' ),
      attributes: models.User.defaultSelect,
      required: false,
      paranoid: false,
    },
    {
      as: 'prevPerformer',
      model: models.User,
      where: Sequelize.literal('"ModelHistory"."field" = \'performerId\'' ),
      attributes: models.User.defaultSelect,
      required: false,
      paranoid: false,
    },
    {
      as: 'author',
      model: models.User,
      attributes: models.User.defaultSelect,
      paranoid: false,
      required: false,
    },
    {
      as: 'task',
      model: models.Task,
      where: Sequelize.literal('"ModelHistory"."entity" = \'Task\'' ),
      attributes: ['id','name', 'deletedAt'],
      paranoid: false,
      required: false,
    },
    {
      as: 'taskTasks',
      model: models.TaskTasks,
      where: Sequelize.literal('"ModelHistory"."entity" = \'TaskTask\'' ),
      paranoid: false,
      required: false,
      include: [
        {
          as: 'task',
          model: models.Task,
          attributes: ['id', 'name', 'deletedAt'],
        }
      ]
    },
    {
      as: 'itemTag',
      model: models.ItemTag,
      where: Sequelize.literal('"ModelHistory"."entity" = \'ItemTag\'' ),
      required: false,
      paranoid: false,
      include: [
        {
          as: 'tag',
          model: models.Tag,
          attributes: ['name'],
          required: false,
          paranoid: false,
        },
      ]
    },
    {
      as: 'taskAttachments',
      model: models.TaskAttachments,
      where: Sequelize.literal('"ModelHistory"."entity" = \'TaskAttachment\'' ),
      attributes: models.TaskAttachments.defaultSelect,
      required: false,
      paranoid: false,
    },
  ];
}
