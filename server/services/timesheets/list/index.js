const timesheetRequest = require('./request');
const { Timesheet } = require('../../../models');

exports.list = async (dateBegin, dateEnd, taskId, userId, userPSId, isSystemUser) => {
  const request = timesheetRequest(dateBegin, dateEnd, taskId, userId, userPSId, isSystemUser);
  const timesheets = await Timesheet.findAll(request);
  return createResponse(timesheets);
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
