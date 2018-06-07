const timesheetRequest = require('./request');
const { Timesheet } = require('../../../models');

exports.listProject = async (dateBegin, dateEnd, projectId, isSystemUser) => {
  const request = timesheetRequest(dateBegin, dateEnd, projectId, isSystemUser);
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
