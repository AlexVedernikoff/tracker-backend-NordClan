const queries = require('../../../models/queries');

async function getTimesheets (queryParams) {
    const timesheets = await queries.timesheet.all(queryParams);
    return timesheets.map(timesheet => transformSpent(timesheet));
}

async function getDrafts (queryParams) {
    const drafts = await queries.timesheetDraft.all(queryParams);
    return drafts.map(draft => transformSpent(draft));
}

async function getTaskSpent (taskId) {
    const queryParams = { taskId: { $eq: taskId } };
    const timesheets = await getTimesheets(queryParams);
    const drafts = await getDrafts(queryParams);
    return [ ...timesheets, ...drafts ];
}

function transformSpent (timesheet) {
    return {
        spentTime: timesheet.dataValues.spentTime,
        taskStatusId: timesheet.dataValues.taskStatus.id
    };
}

exports.getTaskSpent = getTaskSpent;