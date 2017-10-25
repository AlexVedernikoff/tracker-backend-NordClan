'use strict';

const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const moment = require('moment');

/**
 * Функция создания драфтшита
 */
exports.createDraft = function (req, res, next, t = null, isContinue) {
  console.log('Функция создания драфтшита');
  if (req.body.id) delete req.body.id;
  if (req.params.taskId) req.body.taskId = req.params.taskId;
  if (!req.body.sprintId && !isContinue && req.body.sprintId.match(/^[0-9]+$/)) throw createError(400, 'sprintId must be int');

  return models.TimesheetDraft.create(req.body, { returning: false, transaction: t })
    .then((draftsheetModel) => {
      if (isContinue) return draftsheetModel;
      res.json(draftsheetModel);
    })
    .catch((err) => {
      console.log(createError(err));
      throw createError(err);
    });

};

/**
 *  Функция поиска драфтшитов
 */
exports.getDrafts = async function (req, res, next) {
  let where = { userId: req.query.userId };
  if (req.query.onDate) {
    let date = moment(req.query.onDate).format('YYYY-MM-DD');

    Object.assign(where, { $or:
      [
        // Обычные драфты
        {onDate: { $eq: date }},
        // Магические драфты
        {onDate: { $eq: null }},
        // Если задача все еще на тебе и есть драфт с таким статусом же как у задачи, то показываем драфт по этой задаче
        models.sequelize.literal(`"task"."performer_id"  = ${req.query.userId} AND "task"."status_id" = "TimesheetDraft"."task_status_id"`)
      ]
    });
  }
  if (req.params && req.params.sheetId) {
    Object.assign(where, { id: { $eq: req.params.sheetId } });
  }
  if (req.query.taskId) {
    Object.assign(where, { taskId: { $eq: req.query.taskId } });
  }
  if (req.query.taskStatusId) {
    Object.assign(where, { taskStatusId: { $eq: req.query.taskStatusId } });
  }
  try {
    let draftsheets = await models.TimesheetDraft.findAll({
      where: where,
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId', 'projectId'],
      order: [
        ['createdAt', 'ASC']
      ],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: false,
          attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
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
          paranoid: false,
        },
      ]
    });
    let result = [];
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
  } catch (e) {
    throw createError(e);
  }
};


exports.updateVisible = async function (req, res, next) {
  if (!req.params.timesheetDraftId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    const timesheetModel = await queries.timesheetDraft.findDraftSheet(req.user.id, req.params.timesheetDraftId);
    const result = await timesheetModel.updateAttributes(req.body);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};

