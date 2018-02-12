const { Timesheet, Task, User, Project, ProjectUsers, ProjectUsersRoles,
  ProjectRolesDictionary, TimesheetTypesDictionary, Sprint} = require('../../../models');
const _ = require('lodash');
const moment = require('moment');
const Excel = require('exceljs');
const {ByTaskWorkSheet, ByUserWorkSheet} = require('./worksheets');

exports.getReport = async function (projectId, criteria) {
  let startDate;
  let endDate;
  const { label, sprintId } = criteria;
  if (criteria) {
    const validCriteria = validateCriteria(criteria);
    startDate = validCriteria.startDate;
    endDate = validCriteria.endDate;
  }
  const queryParams = {
    projectId: {$eq: projectId},
    ...(sprintId ? (
      {
        sprintId: {$eq: sprintId}
      }
    ) : null),
    ...(criteria ? (
      {
        onDate: {$between: [startDate, endDate]}
      }
    ) : null)
  };
  const project = await Project.findOne({
    where: {id: {$eq: projectId}},
    attributes: ['id', 'name', 'prefix'],
    include: [
      {
        as: 'sprints',
        model: Sprint,
        required: false,
        attributes: ['id', 'name', 'factStartDate', 'factFinishDate'],
        paranoid: false
      }
    ]
  });
  const timeSheetsDbData = await Timesheet.findAll({
    where: queryParams,
    attributes: ['id', 'taskId', 'userId', 'comment', 'spentTime', 'onDate', 'typeId', 'sprintId'],
    include: [
      {
        as: 'task',
        model: Task,
        required: false,
        attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime', 'projectId'],
        paranoid: false
      },
      {
        as: 'user',
        model: User,
        required: false,
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'fullNameRu'],
        paranoid: false,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            where: { projectId: queryParams.projectId },
            attributes: ['id', 'rolesIds'],
            include: [
              {
                as: 'roles',
                model: ProjectUsersRoles
              }
            ]
          }
        ]
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

    const currentProjectRoles = data.user.usersProjects ? data.user.usersProjects[0].roles : [];
    const rolesIds = currentProjectRoles
      .map(role => role.projectRoleId)
      .sort((role1, role2) => role1 - role2);
    const userRolesNames = rolesIds.map(roleId =>
      ProjectRolesDictionary.values.find(item => item.id === roleId).name).join(', ');
    delete data.user.usersProjects;
    data.user.userRolesNames = userRolesNames;
    return data;
  });

  const data = {
    info: { project, range: {startDate, endDate}, label },
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
