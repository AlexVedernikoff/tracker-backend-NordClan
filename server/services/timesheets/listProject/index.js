const { getAllTimesheetsByUser, listByTimeSheets, listByParameters } = require('./request');
const { Timesheet, User } = require('../../../models');
const { TIMESHEET_REPORT_STATUS_SEND_FOR_CONFIRMATION } = require('../../../../common/constants')
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

const filterByStatus = (statusFilter, timesheets) => {
  if (statusFilter == undefined || statusFilter.length <= 0) return timesheets;

  const userStatuses = timesheets.reduce((curUserStatuses, ts) => {
    if (!(ts.dataValues.userId in curUserStatuses)) {
      curUserStatuses[ts.dataValues.userId] = ts.dataValues.statusId
    } else if (curUserStatuses[ts.dataValues.userId] !== ts.dataValues.statusId) {
      curUserStatuses[ts.dataValues.userId] = null
    }
    return curUserStatuses;
  }, {})



  result = timesheets.filter(timesheet => {
    return (
      statusFilter.includes(TIMESHEET_REPORT_STATUS_SEND_FOR_CONFIRMATION) && userStatuses[timesheet.dataValues.userId] === null
      || statusFilter.includes(userStatuses[timesheet.dataValues.userId])
    )
  })

  return result
}

exports.listProjectByParameters = async (params) => {
  const request = listByParameters(params);
  let timesheets = await Timesheet.findAll(request);
  timesheets = filterByStatus(params.statusFilter, timesheets);
  return createResponse(timesheets);
};

function createResponse(timesheets) {
  timesheets.forEach(model => {
    // переношу из задачи в корень объекта
    if (model.task && !model.dataValues.project) {
      model.dataValues.project = model.task.project.dataValues;
      delete model.task.project.dataValues;
    }
  });
  return timesheets;
}
