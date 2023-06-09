const createError = require('http-errors');
const models = require('../../../models');
const moment = require('moment');

/**
 *  Функция поиска драфтшитов
 */
exports.getDrafts = async function (req, res, next) {
  const where = {
    userId: req.query.userId,
  };

  if (req.query.onDate) {
    const date = moment(req.query.onDate).format('YYYY-MM-DD');
    Object.assign(where, { onDate: { $eq: date } });
  }


  if (req.body.sheetId) {
    Object.assign(where, { id: { $eq: req.body.sheetId } });
  }

  if (req.params.sheetId) {
    Object.assign(where, { id: { $eq: req.params.sheetId } });
  }
  if (req.query.taskId) {
    Object.assign(where, { taskId: { $eq: req.query.taskId } });
  }
  if (req.query.taskStatusId) {
    Object.assign(where, { taskStatusId: { $eq: req.query.taskStatusId } });
  }
  try {
    const draftsheets = await models.TimesheetDraft.findAll({
      where: where,
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], [models.sequelize.literal('0'), 'spentTime'], 'typeId', 'taskStatusId', 'userId', 'isVisible', 'taskId', 'projectId'],
      order: [
        ['on_date', 'ASC'],
      ],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: false,
          attributes: {
            include: [[models.sequelize.literal(`(SELECT sum(tsh.spent_time)
            FROM timesheets AS tsh
            WHERE tsh.task_id = "TimesheetDraft"."task_id")`), 'factExecutionTime']],
          },
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false,
            },
            {
              as: 'taskStatus',
              model: models.TaskStatusesDictionary,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false,
            },
          ],
        },
        {
          as: 'taskStatus',
          model: models.TaskStatusesDictionary,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false,
        },
        {
          as: 'projectMaginActivity',
          model: models.Project,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false,
        },
      ],
    });
    const result = [];
    draftsheets.map(ds => {
      Object.assign(ds.dataValues, { project: ds.dataValues.task ? ds.dataValues.task.dataValues.project : null });
      if (ds.dataValues.task) delete ds.dataValues.task.dataValues.project;
      if (!ds.onDate) ds.dataValues.onDate = moment().format('YYYY-MM-DD');

      if (ds.dataValues.projectMaginActivity) {
        Object.assign(ds.dataValues, { project: ds.dataValues.projectMaginActivity.dataValues });
        delete ds.dataValues.projectMaginActivity;
      }

      ds.dataValues.isDraft = true;

      result.push(ds.dataValues);
    });
    return result;
  } catch (err) {
    return next(createError(err));
  }
};
