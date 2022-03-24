const Excel = require('exceljs');
const moment = require('moment');
const {User, Department, UserDepartments, sequelize } = require('../../models');
const _ = require('lodash');
const {ByCompanyUserWorkSheet, ByUserTimesheetsWorkSheet, ByUserWorkSheet, ByTaskWorkSheet} = require('./period/worksheets');

exports.getAverageNumberOfEmployees = async (startDate, endDate, { precision }) => {
  const averageNumberOfEmployees = await sequelize.query(
    `
      select avg(usersdate.total) from (select count(u.id) as total
      from (select generate_series(min(?)::date, max(?)::date, interval '1 day') as dte
          from users
         ) as d left join
        users u
        on  u.employment_date is not null
        and (d.dte >= u.employment_date)
        and (d.dte <= u.delete_date or u.delete_date is null)
      group by d.dte
      order by d.dte) as usersdate
    `,
    {
      replacements: [ startDate, endDate ],
    }
  ).spread((results) => results[0] && results[0].avg || '0');

  if (isNaN(averageNumberOfEmployees)) {
    return averageNumberOfEmployees;
  }

  const averageNumberOfEmployeesToNumber = Number(averageNumberOfEmployees);

  if (typeof precision === 'number') {
    return averageNumberOfEmployeesToNumber.toFixed(precision);
  }

  return averageNumberOfEmployeesToNumber;
};


function getWorkBook () {
  const workbook = new Excel.Workbook();
  workbook.creator = 'Track';
  workbook.lastModifiedBy = 'Track';
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
      visibility: 'visible',
    },
  ];
  return workbook;
}

function getTaskTypeName (typeId, taskTypesValues, lang) {
  const field = lang === 'ru' ? 'name' : 'nameEn';
  return taskTypesValues.find(item => item.id === typeId)[field];
}

function getProjectRoleName (roleId, projectRolesValues, lang) {
  const field = lang === 'ru' ? 'name' : 'nameEn';
  return projectRolesValues.find(item => item.id === roleId)[field];
}

function formatDate (date) {
  return date && moment(date).format('DD.MM.YYYY');
}

function generateMessage (errors) {
  const incorrectParams = errors
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `Incorrect params - ${incorrectParams}`;
}

function withSuffix (baseField, lang) {
  return baseField + '_' + lang;
}

exports.filterTimesheets = (timeSheetsDbData, timesheetTypes, projectRolesValues, lang, taskTypesValues) =>timeSheetsDbData
  .filter(timeSheet => ((timeSheet.dataValues.user.dataValues.delete_date === null
            || new Date(timeSheet.dataValues.onDate) <= timeSheet.dataValues.user.dataValues.delete_date))
        || timeSheet.dataValues.user.dataValues.active === 1)
  .map(timeSheet => {

    const data = timeSheet.dataValues;
    Object.assign(data, { user: data.user.dataValues });

    if (!data.taskId) {
      const type = timesheetTypes.find(dictionary => dictionary.id === timeSheet.typeId);
      Object.assign(data, {
        taskId: -type.id,
        task: {
          name: type.name,
          id: type.id,
          isMagic: type.isMagicActivity,
        },
      });
    } else {
      Object.assign(data, { task: data.task.dataValues });
    }

    const currentProjectRoles = data.user.usersProjects ? data.user.usersProjects[0].roles : [];
    const rolesIds = currentProjectRoles
      .map(role => role.projectRoleId)
      .sort((role1, role2) => role1 - role2);
    const userRolesNames = rolesIds
      .map(roleId => getProjectRoleName(roleId, projectRolesValues, lang))
      .join(', ');
    delete data.user.usersProjects;
    data.user.userRolesNames = userRolesNames;
    data.user.employment_date = formatDate(data.user.employment_date);
    data.task.typeName = data.task.typeId ? getTaskTypeName(data.task.typeId, taskTypesValues, lang) : null;
    return data;
  });

exports.getUserListFromDB = async (where)=>{
  return await User.findAll({
    where: where,
    attributes: [
      'id',
    ],
    include: [
      {
        model: Department,
        as: 'department',
        required: false,
        attributes: ['name', 'id'],
        through: {
          model: UserDepartments,
          attributes: [],
        },
      },
    ],
  });
};

function transformToUserList (timeSheets, lang) {
  const groupedByUser = _.groupBy(timeSheets, timeSheet => timeSheet.userId);
  const suffix = lang.replace(/^[a-zA-Z]{1}/, symbol => symbol.toUpperCase());
  return Object.keys(groupedByUser)
    .map(userId => ({
      user: ((groupedByUser[userId] || [])[0] || {}).user,
      timeSheets: groupedByUser[userId],
    }))
    .sort(({ user: prev }, { user: next }) => {
      if (prev[`lastName${suffix}`] < next[`lastName${suffix}`]) { return -1; }
      if (prev[`lastName${suffix}`] > next[`lastName${suffix}`]) { return 1; }
      return 0;
    });
}

function generateCompanyReportExcellDocument (data, options) {
  const { lang, averageNumberOfEmployees } = options;
  const workbook = getWorkBook();
  const byCompanyUserSheet = new ByCompanyUserWorkSheet(workbook, data, lang, averageNumberOfEmployees);
  byCompanyUserSheet.init();
  return workbook;
}

function generateUserReportExcellDocument (data, options) {
  const { lang, averageNumberOfEmployees } = options;
  const workbook = getWorkBook();
  const byCompanyUserSheet = new ByUserTimesheetsWorkSheet(workbook, data, lang, averageNumberOfEmployees);
  byCompanyUserSheet.init();
  return workbook;
}

function generateExcellDocument (data, options) {
  const { lang } = options;
  const workbook = getWorkBook();
  const byUserSheet = new ByUserWorkSheet(workbook, data, lang);
  const byTaskSheet = new ByTaskWorkSheet(workbook, data, lang);
  byUserSheet.init();
  byTaskSheet.init();
  return workbook;
}

function validateCriteria (criteria) {
  const paramsChecker = {
    startDate: {
      type: 'string',
      regExp: /\d{4}-\d{2}-\d{2}/,
    },
    endDate: {
      type: 'string',
      regExp: /\d{4}-\d{2}-\d{2}/,
    },
  };

  const errors = Object.entries({
    startDate: criteria.startDate,
    endDate: criteria.endDate,
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
    endDate: criteria.endDate,
  };
}

function checkRegExp (regExp, value) {
  if (!regExp) {
    return true;
  }

  return regExp.test(value);
}

function checkTimesheetInSprint (factStartDate, factFinishDate, spentTimeDate) {
  return moment(spentTimeDate).isSameOrBefore(factFinishDate) && moment(factStartDate).isSameOrBefore(spentTimeDate);
}

function groupTimeSheetsInSprint (timeSheets, factStartDate, factFinishDate) {
  return _(timeSheets)
    .groupBy('userId')
    .map(timeSheet => _.transform(timeSheet, (resultObject, task) => {
      if (!_.has(resultObject, 'user')) {
        resultObject.user = task.user;
      }
      if (!_.has(resultObject, 'tasks')) {
        resultObject.tasks = [];
      }
      if (!checkTimesheetInSprint(factStartDate, factFinishDate, task.onDate)) {
        if (!_.has(resultObject, 'otherTasks')) {
          resultObject.otherTasks = [];
        }
        resultObject.otherTasks.push(task);
      } else {
        resultObject.tasks.push(task);
      }
    }, {}))
    .sortBy('user.fullName')
    .value();

}

function divideTimeSheetsBySprints (project, timeSheets, endDate) {
  const sprintsWithTimeSheets = project.sprints
    .sort((sprint1, sprint2) => {
      if (moment(sprint2.factStartDate).isBefore(sprint1.factStartDate)) {
        return 1;
      } else if (moment(sprint1.factStartDate).isBefore(sprint2.factStartDate)) {
        return -1;
      } else {
        return 0;
      }
    })
    .map(sprint => {
      const timeSheetsInSprint = timeSheets.filter(timeSheet => timeSheet.task.sprintId === sprint.id);
      const { factStartDate, factFinishDate, id, name } = sprint;
      return {
        id,
        name,
        factStartDate: formatDate(factStartDate),
        factFinishDate: formatDate(factFinishDate),
        timeSheets: groupTimeSheetsInSprint(timeSheetsInSprint, factStartDate, factFinishDate),
      };
    });
  const timeSheetsWithoutSprint = timeSheets.filter(timeSheet => !timeSheet.task.sprintId);
  if (timeSheetsWithoutSprint.length > 0) {
    const factStartDate = formatDate(project.createdAt);
    const factFinishDate = formatDate(endDate);
    sprintsWithTimeSheets.push({
      id: 0,
      name: 'Backlog',
      factStartDate: factStartDate,
      factFinishDate: factFinishDate,
      timeSheets: groupTimeSheetsInSprint(timeSheetsWithoutSprint, project.createdAt, endDate),
    });
  }
  return sprintsWithTimeSheets;
}


exports.getProjectRoleName = getProjectRoleName;
exports.formatDate = formatDate;
exports.getTaskTypeName = getTaskTypeName;
exports.generateMessage = generateMessage;
exports.withSuffix = withSuffix;
exports.divideTimeSheetsBySprints = divideTimeSheetsBySprints;
exports.groupTimeSheetsInSprint = groupTimeSheetsInSprint;
exports.checkTimesheetInSprint = checkTimesheetInSprint;
exports.checkRegExp = checkRegExp;
exports.transformToUserList = transformToUserList;
exports.generateCompanyReportExcellDocument = generateCompanyReportExcellDocument;
exports.generateUserReportExcellDocument = generateUserReportExcellDocument;
exports.generateExcellDocument = generateExcellDocument;
exports.validateCriteria = validateCriteria;
exports.getWorkBook = getWorkBook;
