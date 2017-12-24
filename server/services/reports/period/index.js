const {Timesheet, Task, User, Project} = require('../../../models');
const _ = require('lodash');
const moment = require('moment');
const Excel = require('exceljs');
const {ByTaskWorkSheet, ByUserWorkSheet} = require('./worksheets');

exports.getReport = async function (criteria, projectId) {
    const {startDate, endDate} = validateCriteria(criteria);

    const queryParams = {projectId: {$eq: projectId}, onDate: {$between: [startDate, endDate]}};
    const project = await Project.findOne({
        where: {id: {$eq: projectId}},
        attributes: ['id', 'name', 'prefix']
    });
    const timeSheets = await Timesheet.findAll({
        where: queryParams,
        attributes: ['id', 'taskId', 'userId', 'comment', 'spentTime', 'onDate'],
        include: [
            {
                as: 'task',
                model: Task,
                required: false,
                attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
                paranoid: false
            },
            {
                as: 'user',
                model: User,
                required: false,
                attributes: ['id', 'firstNameRu', 'lastNameRu', 'fullNameRu'],
                paranoid: false
            }
        ]
    });
    const data = {
        info: {project, range: {startDate, endDate}},
        byTasks: _(timeSheets)
            .groupBy('taskId')
            .map((v) => _.transform(v, (t, usr) => {
                if (!_.has(t, 'task')) {
                    t.task = usr.task.dataValues
                }
                if (!_.has(t, 'users')) {
                    t.users = []
                }
                t.users.push(usr.dataValues)
            }, {}))
            .value(),

        byUser: _(timeSheets)
            .groupBy('userId')
            .map((v) => _.transform(v, (t, tsk) => {
                if (!_.has(t, 'user')) {
                    t.user = tsk.user.dataValues
                }
                if (!_.has(t, 'tasks')) {
                    t.tasks = []
                }
                t.tasks.push(tsk)
            }, {}))
            .value(),
    };
    return generateExcellDocument(data);
};

function generateExcellDocument(data) {
    const workbook = new Excel.Workbook();
    workbook.creator = 'SimTrack';
    workbook.lastModifiedBy = 'SimTrack';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 0, visibility: 'visible'
        }
    ];
    const byUserSheet = new ByUserWorkSheet(workbook, data);
    const byTaskSheet = new ByTaskWorkSheet(workbook, data);
    byUserSheet.init();
    byTaskSheet.init();
    return workbook;
}

function validateCriteria(criteria) {
    const paramsChecker = {
        startDate: {
            type: 'string',
            regExp: /\d{4}-\d{2}-\d{2}/
        },
        endDate: {
            type: 'string',
            regExp: /\d{4}-\d{2}-\d{2}/
        }
    };

    const errors = Object.entries({
        startDate: criteria.startDate,
        endDate: criteria.endDate
    }).filter(([key, value]) => {
        const checker = paramsChecker[key];
        return checker.type !== typeof value || !checkRegExp(checker.regExp, value);
    });

    if (errors.length > 0) {
        throw generateMessage(errors);
    }

    if (moment(criteria.startDate).isAfter(moment(criteria.endDate))) {
        throw 'Incorrect date range';
    }

    return {
        startDate: criteria.startDate,
        endDate: criteria.endDate
    }
}

function checkRegExp(regExp, value) {
    if (!regExp) {
        return true;
    }

    return regExp.test(value);
}

function generateMessage(errors) {
    const incorrectParams = errors
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

    return `Incorrect params - ${incorrectParams}`;
}