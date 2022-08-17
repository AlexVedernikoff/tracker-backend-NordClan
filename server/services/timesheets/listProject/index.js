const { getAllTimesheetsByUser, listByTimeSheets } = require('./request');
const { Timesheet, User } = require('../../../models');
const moment = require('moment');

exports.listProject = async (dateBegin, dateEnd, projectId, isSystemUser) => {
  const request = getAllTimesheetsByUser(dateBegin, dateEnd, projectId, isSystemUser);

  const users = await User.findAll(request)
    .filter(user => user.dataValues.timesheet.length > 0
      || user.dataValues.active === 1);

  if (projectId === undefined) {
    return createResponse(users.filter(user => user.dataValues.delete_date === undefined || moment(user.dataValues.delete_date).isAfter(dateBegin)));
  } else {
    return createResponse(users);
  }
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
