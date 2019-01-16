const queries = require('../../../models/queries');

async function getTaskSpent (taskId) {
  const queryParams = {taskId: {$eq: taskId}};
  const timesheets = await getTimesheets(queryParams);
  return [...timesheets];
}

async function getTimesheets (queryParams) {
  const timesheets = await queries.timesheet.all(queryParams);
  return timesheets.map(timesheet => transformSpent(timesheet));
}

function transformSpent (timesheet) {
  return {
    spentTime: timesheet.dataValues.spentTime,
    taskStatusId: timesheet.task.taskStatus.id,
    user: timesheet.dataValues.user,
    userRole: timesheet.dataValues.userRoleId
  };
}

async function getTaskFactTimeByQa (taskId) {
  const qaTimesheets = await getTaskSpent(taskId);
  const qaFactTime = qaTimesheets
    .filter(timesheet => timesheet.taskStatusId === 7)
    .reduce((total, timesheet) => total + +(timesheet.spentTime), 0);
  return qaFactTime ? qaFactTime : 0;
}

module.exports = { getTaskSpent, getTaskFactTimeByQa };
