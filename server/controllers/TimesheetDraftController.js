'use strict'

const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const queries = require('../models/queries');
const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

/**
 * нужны драфты на сегодняшнее число поставленные на меня слепки
 * 
 * нужно апи для записи в слепок при смене у задачи исполнителя или стадии или и того и того
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

exports.getDrafts = async function (req, res, next) {
    try {
        let date = new Date(req.query.onDate);
        let draftsheets = await models.TimesheetDraft.findAll({
            where: {
                userId: req.params.userId,
                onDate: {
                    $eq: date
                }
            },
            attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible'],
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
            Object.assign(ds.dataValues, {project: ds.dataValues.task.dataValues.project});
            delete ds.dataValues.task.dataValues.project;
            delete ds.dataValues.taskStatusId;
            result.push(ds.dataValues);
        });
        return result;
    } catch (e) {
        return next(createError(e));
    }
};