const { getAllTimesheetsByUser, listByTimeSheets } = require('./request');
const { Timesheet, User } = require('../../../models');
const moment = require('moment');

const isAfterDateBegin = (delete_date, dateBegin) => {
  return moment(delete_date).isAfter(dateBegin);
};

exports.listProject = async (dateBegin, dateEnd, projectId, isSystemUser) => {
  const request = getAllTimesheetsByUser(dateBegin, dateEnd, projectId, isSystemUser);

  const users = await User.findAll(request)
    .filter(user => user.dataValues.timesheet.length > 0
      || user.dataValues.active === 1);

  if (projectId === undefined) {
    return createResponse(users.filter(({dataValues: {delete_date}}) => {
      return (delete_date && isAfterDateBegin(delete_date, dateBegin)) || !delete_date;
    }));
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
