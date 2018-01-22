const models = require('../../../models');
const queries = require('../../../models/queries');

exports.isNeedCreateDraft = async (task, statusId, onDate, currentUserId) => {
  if (task.performerId !== currentUserId || !task.statusId) {
    return false;
  }

  const queryParams = {
    taskId: task.id,
    onDate: new Date(onDate),
    userId: task.performerId
  };

  const timesheets = await queries.timesheet.all(queryParams);
  const drafts = await queries.timesheetDraft.all(queryParams);

  return (drafts.length === 0 && timesheets.length === 0)
    && (models.TaskStatusesDictionary.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS.indexOf(parseInt(statusId) > 0));
};
