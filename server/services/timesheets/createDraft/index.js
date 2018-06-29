const models = require('../../../models');
const moment = require('moment');

exports.createDraft = async (params) => {
  await models.TimesheetDraft.create(params, { returning: true });
};

exports.getDraft = async (params) => {
  const draft = await models.TimesheetDraft.findOne({
    where: params,
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: ['id', 'name', 'plannedExecutionTime', [
          models.sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "TimesheetDraft"."task_id")`), 'factExecutionTime']],
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name', 'prefix'],
            paranoid: false
          },
          {
            as: 'taskStatus',
            model: models.TaskStatusesDictionary,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false
          }
        ]
      },
      {
        as: 'taskStatus',
        model: models.TaskStatusesDictionary,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      },
      {
        as: 'projectMaginActivity',
        model: models.Project,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false
      }
    ]
  });

  const transformedDraft = transformDraft(draft);
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
