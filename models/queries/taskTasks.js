const models = require('../');

exports.name = 'taskTasks';

exports.findLinkedTasks = function(taskId, attributes = ['id', 'name']) {
  let result = [];
  
  return models.TaskTasks.findAll({
    where: {
      taskId: taskId
    },
    include: [
      {
        as: 'task',
        model: models.Task,
        attributes: attributes,
        required: true,
      }
    ]
  })
    .then((taskTasks) => {
  
      taskTasks.forEach((model) => {
        result.push({
          id: model.task.id,
          name: model.task.name,
        });
      });
    
      return result;

    });
};