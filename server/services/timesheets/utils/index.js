const models = require('../../../models');
const queries = require('../../../models/queries');

const {
  DEVELOP_STATUSES,
  CODE_REVIEW_STATUSES,
  QA_STATUSES,
  CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS
} = models.TaskStatusesDictionary;

exports.isNeedCreateDraft = async (task, statusId, onDate) => {
  if (!task.statusId) {
    return false;
  }

  const statuses = [
    DEVELOP_STATUSES,
    CODE_REVIEW_STATUSES,
    QA_STATUSES
  ];

  const currentStageStatuses = statuses.find(item => item.includes(statusId));

  const queryParams = {
    taskStatusId: currentStageStatuses ? currentStageStatuses : statusId,
    taskId: task.id,
    onDate: new Date(onDate),
    userId: task.performerId
  };

  const timesheets = await queries.timesheet.all(queryParams);
  const drafts = await queries.timesheetDraft.all(queryParams);

  return (drafts.length === 0 && timesheets.length === 0)
  && (CAN_CREATE_DRAFT_BY_CHANGES_TASKS_STATUS.indexOf(parseInt(statusId)) >= 0);
};
