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

const updateStatusForProject = async (userId, dateBegin, dateEnd, status, projectId, justRejected, approvedByUserId = null) => {
  validate(userId, dateBegin, dateEnd, status);

  const submittedStatus = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'submitted' } },
  });

  let statusId = TimesheetStatusesDictionary.ALL_IDS;
  if (justRejected && status.dataValues.id === submittedStatus.id){
    statusId = TimesheetStatusesDictionary.NON_BLOCKED_IDS;
  }

  const where = {
    userId,
    onDate: {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd,
      },
    },
    statusId,
    projectId,
  };

  if (projectId === 0){
    where.projectId = { $or: [
      0, null,
    ],
    };
  }

  const timesheets = await Timesheet.update({ statusId: status.dataValues.id, approvedByUserId }, { where, returning: true });
  return timesheets[1];
};

const updateStatus = async (userId, dateBegin, dateEnd, status, justRejected, approvedByUserId = null) => {
  validate(userId, dateBegin, dateEnd, status);

  const submittedStatus = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'submitted' } },
  });

  let statusId = TimesheetStatusesDictionary.ALL_IDS;
  if (justRejected && status.dataValues.id === submittedStatus.id){
    statusId = TimesheetStatusesDictionary.NON_BLOCKED_IDS;
  }

  const where = {
    userId,
    onDate: {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd,
      },
    },
    statusId,
  };
  const timesheets = await Timesheet.update({ statusId: status.dataValues.id, approvedByUserId }, { where, returning: true });
  return timesheets[1];
};

exports.submit = async (userId, dateBegin, dateEnd, projectId, justRejected) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'submitted' } },
  });
  if (projectId || projectId === 0) {
    return updateStatusForProject(userId, dateBegin, dateEnd, status, projectId, justRejected);
  }
  return updateStatus(userId, dateBegin, dateEnd, status, justRejected);
};

exports.approve = async (userId, dateBegin, dateEnd, projectId, approvedByUserId) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'approved' } },
  });
  if (projectId || projectId === 0) {
    return updateStatusForProject(userId, dateBegin, dateEnd, status, projectId, undefined, approvedByUserId);
  }
  return updateStatus(userId, dateBegin, dateEnd, status, undefined, approvedByUserId);
};

exports.reject = async (userId, dateBegin, dateEnd, projectId) => {
  const status = await TimesheetStatusesDictionary.findOne({
    where: { name: { $eq: 'rejected' } },
  });
  if (projectId || projectId === 0) {
    return updateStatusForProject(userId, dateBegin, dateEnd, status, projectId);
  }
  return updateStatus(userId, dateBegin, dateEnd, status);
};
