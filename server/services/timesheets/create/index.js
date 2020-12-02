const models = require('../../../models');
const queries = require('../../../models/queries');

exports.create = async (params) => {
  const alreadyCreated = await queries.timesheet.getTimesheetByParams(params);
  if (alreadyCreated) {
    await alreadyCreated.destroy();
  }
  const draftToDestroy = await queries.timesheetDraft.getDraftToDestroy(params);
  if (draftToDestroy) {
    await models.TimesheetDraft.destroy({ where: { id: draftToDestroy.id } });
  }

  let isBill = false;

  if (params.projectId !== null && params.projectId !== 0){
    isBill = await queries.timesheet.isBillableFlag({userId: params.userId, projectId: params.projectId});
  }

  const object = {...params, isBillable: isBill};

  const { id } = await models.Timesheet.create(object);
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
