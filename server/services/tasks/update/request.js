const models = require('../../../models');
const queries = require('../../../models/queries');
const { Task, Tag, ItemTag } = models;

exports.findByPrimary = (id, role) => {
  return Task.findByPrimary(id, {
    attributes: queries.task.defaultAttributes(role),
    include: [
      {
        as: 'tags',
        model: Tag,
        attributes: ['name'],
        through: {
          model: ItemTag,
          attributes: [],
        },
        order: [
          ['name', 'ASC'],
        ],
      },
      {
        as: 'project',
        model: models.Project,
        attributes: ['id', 'name', 'prefix', 'qaPercent'],
      },
      {
        as: 'parentTask',
        model: models.Task,
        attributes: ['id', 'name'],
      },
      {
        as: 'author',
        model: models.User,
        attributes: models.User.defaultSelect,
      },
      {
        as: 'subTasks',
        model: models.Task,
        attributes: ['id', 'name', 'statusId'],
        where: {
          statusId: {
            $ne: models.TaskStatusesDictionary.CANCELED_STATUS,
          },
          deletedAt: {
            $eq: null,
          },
        },
        required: false,
      },
      {
        as: 'linkedTasks',
        model: models.Task,
        through: {
          model: models.TaskTasks,
          attributes: [],
        },
        attributes: ['id', 'name', 'statusId'],
        where: {
          statusId: {
            $ne: models.TaskStatusesDictionary.CANCELED_STATUS,
          },
          deletedAt: {
            $eq: null,
          },
        },
        required: false,
      },
      {
        as: 'sprint',
        model: models.Sprint,
        attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', /*'allottedTime', DEPRECATED*/ 'budget', 'qaPercent'],
      },
      {
        as: 'performer',
        model: models.User,
        attributes: models.User.defaultSelect,
      },
      {
        as: 'attachments',
        model: models.TaskAttachments,
        attributes: models.TaskAttachments.defaultSelect,
        order: [
          ['createdAt', 'ASC'],
        ],
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
    ],
  });
};
