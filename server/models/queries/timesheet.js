const models = require('../');
const createError = require('http-errors');

exports.name = 'timesheet';

// проверка является ли исполнителем указанный пользователь
exports.canUserChangeTimesheet = function(userId, timesheetId) {
  
  return models.Timesheet
    .findOne({
      required: true,
      where: {
        id: timesheetId,
      },
      attributes: ['id'],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: true,
          attributes: [],
          where: {
            statusId: {
              $notIn: models.TaskStatusesDictionary.NOT_AVAILABLE_STATUSES
            }
          },
          include: [
            {
              as: 'performer',
              model: models.User,
              attributes: ['id', 'firstNameRu', 'lastNameRu'],
              through: {
                model: models.TaskUsers,
                attributes: [],
                paranoid: false
              
              },
              required: true,
              where: {
                id: userId,
              },
            },
          ],
        }
      ],
    })
    .then((model) => {
      if(!model) throw createError(404, 'User can\'t change timesheet');
      return model;
    });
  
};