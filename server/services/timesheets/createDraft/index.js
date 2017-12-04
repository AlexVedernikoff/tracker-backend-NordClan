const Sequelize = require('../../../orm/index');
const models = require('../../../models');
const queries = require('../../../models/queries');
const moment = require('moment');

exports.createDraft = async (params, userId, transaction) => {
  const draft = await models.TimesheetDraft.create(params, { returning: true, transaction });
  transaction.commit();

  const include = ['task', 'taskStatus', 'projectMaginActivity'];
  const extensibleDraft = await queries.timesheetDraft.findDraft({userId, taskId: draft.taskId, onDate: draft.onDate}, include);
  const transformedDraft = transformDraft(extensibleDraft);
  return transformedDraft;
};

function transformDraft (draft) {
  Object.assign(draft.dataValues, { project: draft.dataValues.task ? draft.dataValues.task.dataValues.project : null });
  if (draft.dataValues.task) delete draft.dataValues.task.dataValues.project;
  if (!draft.onDate) draft.dataValues.onDate = moment().format('YYYY-MM-DD');

  if (draft.dataValues.projectMaginActivity) {
    Object.assign(draft.dataValues, { project: draft.dataValues.projectMaginActivity.dataValues });
    delete draft.dataValues.projectMaginActivity;
  }

  draft.dataValues.isDraft = true;

  return draft.dataValues;
}
