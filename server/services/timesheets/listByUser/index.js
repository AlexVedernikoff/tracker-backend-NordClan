const { getAllTimesheetsByUser } = require('./request');
const { User } = require('../../../models');

exports.listByUser = async (userId) => {
  const request = getAllTimesheetsByUser(userId);
  const users = await User.findAll(request)
    .filter(user => user.dataValues.timesheet.length > 0
          || user.dataValues.active === 1);
  return createResponse(users);
};

function createResponse (timesheets) {
  timesheets.forEach(model => {
    // переношу из задачи в корень объекта
    if (model.task && !model.dataValues.project) {
      model.dataValues.project = model.task.project.dataValues;
      delete model.task.project.dataValues;
    }
  });
  return timesheets;
}
