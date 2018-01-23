const models = require('../../../models');
const queries = require('../../../models/queries');

exports.isNeedCreateDraft = async (task, statusId, onDate, currentUserId) => {
  if (task.performerId !== currentUserId || !task.statusId) {
    return false;
  }

  const queryParams = {
    taskStatusId: statusId,
    taskId: task.id,
    onDate: new Date(onDate),
    userId: task.performerId
  };

  const timesheets = await queries.timesheet.all(queryParams);
  const drafts = await queries.timesheetDraft.all(queryParams);

  const newStatus = task.statusId;
  const previousStatus = task.taskStatus.id;

  const checkChangePlayToStop = (prevSt, newSt) =>
    (prevSt === 2 && newSt === 3) || (prevSt === 4 && newSt === 5) || (prevSt === 6 && newSt === 7);

  return (drafts.length === 0 && timesheets.length === 0)
    && !checkChangePlayToStop(previousStatus, newStatus)
    && (models.TaskStatusesDictionary.CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS.indexOf(parseInt(statusId)) >= 0);
};
