const { listByUser, listByTimeSheets } = require('./request');
const { Timesheet, User } = require('../../../models');

exports.listProject = async (dateBegin, dateEnd, projectId, isSystemUser) => {
  const request = listByUser(dateBegin, dateEnd, projectId, isSystemUser);
  const timesheets = await User.findAll(request)
    .filter(timesheet => timesheet.dataValues.timesheet.length > 0
      || timesheet.dataValues.active === 1);
  return createResponse(timesheets);
};

exports.listProjectByTimeSheets = async (dateBegin, dateEnd, projectId, isSystemUser) => {
  const request = listByTimeSheets(dateBegin, dateEnd, projectId, isSystemUser);
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
