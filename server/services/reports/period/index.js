const {Timesheet, Task, User, Project, ProjectRolesDictionary, TimesheetTypesDictionary} = require('../../../models');
const _ = require('lodash');
const moment = require('moment');
const Excel = require('exceljs');
const {ByTaskWorkSheet, ByUserWorkSheet} = require('./worksheets');

exports.getReport = async function (projectId, criteria) {
  let startDate;
  let endDate;
  if (criteria) {
    const validCriteria = validateCriteria(criteria);
    startDate = validCriteria.startDate;
    endDate = validCriteria.endDate;
  }
  const queryParams = {
    projectId: {$eq: projectId},
    ...(criteria ? (
      {
        onDate: {$between: [startDate, endDate]}
      }
    ) : null)
  };
  const project = await Project.findOne({
    where: {id: {$eq: projectId}},
    attributes: ['id', 'name', 'prefix']
  });
  const timeSheetsDbData = await Timesheet.findAll({
    where: queryParams,
    attributes: ['id', 'taskId', 'userId', 'comment', 'spentTime', 'onDate', 'typeId', 'userRoleId'],
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
    ],
    order: [
      [ { model: User, as: 'user' }, 'fullNameRu', 'ASC' ],
      [ 'onDate', 'ASC' ]
    ]
  });
  const timeSheets = timeSheetsDbData.map(timeSheet => {
    const data = timeSheet.dataValues;
    Object.assign(data, {user: data.user.dataValues});
    if (!data.taskId) {
      const type = TimesheetTypesDictionary.values.find(dictionary => dictionary.id === timeSheet.typeId);
      Object.assign(data, {
        taskId: -type.id,
        task: {
          name: type.name,
          id: type.id,
          isMagic: true
        }
      });
    } else {
      Object.assign(data, {task: data.task.dataValues});
    }
    return data;
  });

  const timeSheetsWithRoles = timeSheets.map((timeSheet) => {
    // список ролей приходит в виде строки содержащей массив (например "[1, 2, 7]")
    const userRoleId = timeSheet.userRoleId.replace('[', '').replace(']', '').split(',')
      .map(item => Number(item))
      .sort((item1, item2) => item1 - item2);
    const userRolesNames = userRoleId.map(roleId => {
      console.log('ProjectRolesDictionary.values', ProjectRolesDictionary.values);
      return ProjectRolesDictionary.values.find(item => item.id === roleId).name;
    });
    return {
      ...timeSheet,
      userRolesNames
    };
  });

  const data = {
    info: {project, range: {startDate, endDate}},
    byTasks: _(timeSheets)
      .groupBy('taskId')
      .map(timeSheet => _.transform(timeSheet, (resultObject, user) => {
        if (!_.has(resultObject, 'task')) {
          resultObject.task = user.task;
        }
        if (!_.has(resultObject, 'users')) {
          resultObject.users = [];
        }
        resultObject.users.push(user);
      }, {}))
      .value(),
    byUser: _(timeSheets)
      .groupBy('userId')
      .map(timmeSheet => _.transform(timmeSheet, (resultObject, task) => {
        if (!_.has(resultObject, 'user')) {
          resultObject.user = task.user;
        }
        if (!_.has(resultObject, 'tasks')) {
          resultObject.tasks = [];
        }
        resultObject.tasks.push(task);
      }, {}))
      .sortBy('user.fullNameRu')
      .value()
  };

  return {
    workbook: generateExcellDocument(data),
    options: {
      fileName: `${project.name} - ${criteria ? (startDate + ' - ' + endDate) : 'За весь проект'}`
    }
  };
};

function generateExcellDocument (data) {
  const workbook = new Excel.Workbook();
  workbook.creator = 'SimTrack';
  workbook.lastModifiedBy = 'SimTrack';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();
  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: 'visible'
    }
  ];
  const byUserSheet = new ByUserWorkSheet(workbook, data);
  const byTaskSheet = new ByTaskWorkSheet(workbook, data);
  byUserSheet.init();
  byTaskSheet.init();
  return workbook;
}

function validateCriteria (criteria) {
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
    throw new Error('Incorrect date range');
  }

  return {
    startDate: criteria.startDate,
    endDate: criteria.endDate
  };
}

function checkRegExp (regExp, value) {
  if (!regExp) {
    return true;
  }

  return regExp.test(value);
}

function generateMessage (errors) {
  const incorrectParams = errors
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `Incorrect params - ${incorrectParams}`;
}
