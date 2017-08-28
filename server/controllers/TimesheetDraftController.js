'use strict'

const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const queries = require('../models/queries');
const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

/**
 * Функция создания драфтшита
 */
exports.createDraft = async function (req, res, next) {
    req.body.taskId = req.params.taskId;
    try {
        let draftsheetModel = await models.TimesheetDraft.create(req.body);
        res.json(draftsheetModel);
    } catch (e) {
        return next(createError(e));
    }
};

/**
 *  Функция поиска драфтшитов
 */
exports.getDrafts = async function (req, res, next) {
    let where = { userId: req.query.userId };
    if (req.query.onDate) {
        let date = new Date(req.query.onDate);
        Object.assign(where, { onDate: { $eq: date } });
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
        let date = new Date(req.query.onDate);
        let draftsheets = await models.TimesheetDraft.findAll({
            where: where,
            attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId'],
            order: [
                ['createdAt', 'ASC']
            ],
            include: [
                {
                    as: 'task',
                    model: models.Task,
                    required: true,
                    attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
                    paranoid: false,
                    include: [
                        {
                            as: 'project',
                            model: models.Project,
                            required: true,
                            attributes: ['id', 'name'],
                            paranoid: false,
                        },
                        {
                            as: 'taskStatus',
                            model: models.TaskStatusesDictionary,
                            required: true,
                            attributes: ['id', 'name'],
                            paranoid: false,
                        }
                    ]
                },
                {
                    as: 'taskStatus',
                    model: models.TaskStatusesDictionary,
                    required: true,
                    attributes: ['id', 'name'],
                    paranoid: false
                }
            ]
        });
        let result = [];
        draftsheets.map(ds => {
            Object.assign(ds.dataValues, { project: ds.dataValues.task.dataValues.project, isDraft: true });
            delete ds.dataValues.task.dataValues.project;
            result.push(ds.dataValues);
        });
        return result;
    } catch (e) {
        return next(createError(e));
    }
};