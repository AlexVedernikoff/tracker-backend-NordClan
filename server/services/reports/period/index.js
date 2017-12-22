const queries = require('../../../models/queries');
const {Timesheet, Task, User, Project} = require('../../../models');
const _ = require('lodash');

exports.getReport = async function (criteria, projectId) {
    const {startDate, endDate} = validateCriteria(criteria);

    const queryParams = {projectId: {$eq: projectId}, onDate: {$between: [startDate, endDate]}};
    const project = await Project.findOne({
        where: {id: {$eq: projectId}},
        attributes: ['id', 'name', 'prefix']
    });
    const timeSheets = await Timesheet.findAll({
        where: queryParams,
        attributes: ['id', 'taskId', 'userId', 'comment', 'spentTime'],
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
            .map((v) => _(v)
                .transform((t, usr) => {
                    if (!_.has(t, 'task')) {
                        t.task = usr.task
                    }
                    if (!_.has(t, 'users')) {
                        t.users = []
                    }
                    t.users.push(usr)
                }, {})),

        byUser: _(timeSheets)
            .groupBy('userId')
            .map((v) => _(v)
                .transform((t, tsk) => {
                    if (!_.has(t, 'user')) {
                        t.user = tsk.user
                    }
                    if (!_.has(t, 'tasks')) {
                        t.tasks = []
                    }
                    t.tasks.push(tsk)
                }, {})),
    };
    return data;
};

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