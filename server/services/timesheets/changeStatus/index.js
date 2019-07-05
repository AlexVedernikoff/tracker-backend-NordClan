const { Timesheet, TimesheetStatusesDictionary } = require('../../../models');
const createError = require('http-errors');
const moment = require('moment');

const validate = (userId, dateBegin, dateEnd, status) => {
  if (!userId) {
    throw createError(404, 'UserId should be specified');
  }
  if (moment(dateEnd).diff(moment(dateBegin), 'day') !== 6) {
    throw createError(404, 'Wrong date range, should be week');
  }
  if (moment(dateBegin).weekday() !== 1) {
    throw createError(404, 'Wrong week start, should be the monday');
  }
  if (!status) {
    throw createError(404, 'Unknown timesheet status');
  }
};

const updateStatus = async (userId, dateBegin, dateEnd, status) => {
  validate(userId, dateBegin, dateEnd, status);
  const where = {
    userId,
    onDate: {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    }
  };
  const timesheets = await Timesheet.update({ statusId: status.dataValues.id }, { where, returning: true });
  return timesheets[1];
};

exports.submit = async (userId, dateBegin, dateEnd) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'submitted' }}
  });
  return updateStatus(userId, dateBegin, dateEnd, status);
};

exports.approve = async (userId, dateBegin, dateEnd) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'approved' }}
  });
  return updateStatus(userId, dateBegin, dateEnd, status);
};

exports.reject = async (userId, dateBegin, dateEnd) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'rejected' }}
  });
  return updateStatus(userId, dateBegin, dateEnd, status);
};
