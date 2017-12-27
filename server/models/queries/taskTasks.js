const models = require('../');

exports.name = 'taskTasks';

exports.findLinkedTasks = function (taskId, attributes = ['id', 'name'], t = null) {
  const result = [];

  return models.TaskTasks.findAll({
    where: {
      taskId: taskId
    },
    transaction: t,
    include: [
      {
        as: 'task',
        model: models.Task,
        attributes: attributes,
        required: true,
        where: {
          statusId: {
            $ne: models.TaskStatusesDictionary.CANCELED_STATUS
          },
          deletedAt: {
            $eq: null
          }
        }
      }
    ]
  })
    .then((taskTasks) => {

      taskTasks.forEach((model) => {
        result.push({
          id: model.task.id,
          name: model.task.name
        });
      });

      return result;

    });
};
