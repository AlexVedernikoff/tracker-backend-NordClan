const queries = require('../../../models/queries');

async function getTimesheets (queryParams) {
    const timesheets = await queries.timesheet.all(queryParams);
    return timesheets.map(timesheet => transformSpent(timesheet));
}

async function getTaskSpent (taskId) {
    const queryParams = { taskId: { $eq: taskId } };
    const timesheets = await getTimesheets(queryParams);
    return [ ...timesheets ];
}

function transformSpent (timesheet) {
    return {
        spentTime: timesheet.dataValues.spentTime,
        taskStatusId: timesheet.dataValues.taskStatus.id
    };
}

exports.getTaskSpent = getTaskSpent;