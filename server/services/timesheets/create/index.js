const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async (params) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(params);
  if (!isNeedCreateTimesheet) {
    throw new Error(`Some timesheet already exists on date ${params.onDate}`);
  }
  const draftToDestroy = await queries.timesheetDraft.getDraftToDestroy(params);
  if (draftToDestroy) {
    await models.TimesheetDraft.destroy({ where: { id: draftToDestroy.id } });
  }
  const { id } = await models.Timesheet.create(params);
  const createdTimesheet = await queries.timesheet.getTimesheet({ id });
  createdTimesheet.isDraft = false;

  return transformTimesheet(createdTimesheet);
};

function transformTimesheet (timesheet) {
  if (timesheet.dataValues.projectMaginActivity) {
    Object.assign(timesheet.dataValues, { project: timesheet.dataValues.projectMaginActivity.dataValues, isDraft: false });
    delete timesheet.dataValues.projectMaginActivity;
  }

  timesheet.dataValues.onDate = timesheet.onDate;

  return timesheet.dataValues;
}
