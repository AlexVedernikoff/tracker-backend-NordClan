const models = require('../../../models');
const { Task, Tag, ItemTag } = models;

exports.findByPrimary = (id) => {
  return Task.findByPrimary(id, {
    include: [
      {
        as: 'tags',
        model: Tag,
        attributes: ['name'],
        through: {
          model: ItemTag,
          attributes: []
        },
        order: [
          ['name', 'ASC']
        ]
      },
      {
        as: 'project',
        model: models.Project,
        attributes: ['id', 'name', 'prefix']
      },
      {
        as: 'parentTask',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'author',
        model: models.User,
        attributes: models.User.defaultSelect
      },
      {
        as: 'subTasks',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'linkedTasks',
        model: models.Task,
        through: {
          model: models.TaskTasks,
          attributes: []
        },
        attributes: ['id', 'name']
      },
      {
        as: 'sprint',
        model: models.Sprint,
        attributes: ['id', 'name']
      },
      {
        as: 'performer',
        model: models.User,
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo']
      },
      {
        as: 'attachments',
        model: models.TaskAttachments,
        attributes: models.TaskAttachments.defaultSelect,
        order: [
          ['createdAt', 'ASC']
        ]
      }
    ]
  });
};
