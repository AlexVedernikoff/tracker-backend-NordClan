const {
  Timesheet,
  Task,
  TaskTypesDictionary,
  User,
  Project,
  ProjectUsers,
  ProjectUsersRoles,
  ProjectRolesDictionary,
  TimesheetTypesDictionary,
  Sprint,
  Department,
  UserDepartments,
  sequelize,
} = require('../../../models');
const _ = require('lodash');
const moment = require('moment');
const { ByTaskWorkSheet, ByUserWorkSheet, ByCompanyUserWorkSheet } = require('./worksheets');
const { listProjectByTimeSheets } = require('../../timesheets/listProject/index.js');
const i18n = require('./i18n.json');
const { getAverageNumberOfEmployees, getWorkBook } = require('../utils');

exports.getReport = async function (projectId, criteria, options) {
  const { lang = 'en' } = options || {};
  let startDate;
  let endDate;
  const { label, sprintId } = criteria;
  const locale = i18n[lang];

  const timesheetTypes = await TimesheetTypesDictionary.findAll();
  if (criteria) {
    const validCriteria = validateCriteria(criteria);
    startDate = validCriteria.startDate;
    endDate = validCriteria.endDate;
  }
  const queryParams = {
    projectId: { $eq: projectId },
    ...(criteria ? (
      {
        onDate: { $between: [startDate, endDate] },
      }
    ) : null),
    spentTime: {
      $gt: 0,
    },
  };

  const parseSprintId = parseInt(sprintId);
  if (!isNaN(parseSprintId) && parseSprintId === 0) { // backlog
    queryParams.sprintId = {
      $or: [0, null],
    };
  } else if (!isNaN(parseSprintId) && parseInt(sprintId) > 0) { // sprint
    queryParams.sprintId = {
      $eq: sprintId,
    };
  }

  const project = await Project.findOne({
    where: { id: { $eq: projectId } },
    attributes: ['id', 'name', 'prefix', 'createdAt', 'completedAt'],
    include: [
      {
        as: 'sprints',
        model: Sprint,
        required: false,
        attributes: ['id', 'name', 'factStartDate', 'factFinishDate'],
        paranoid: false,
      },
    ],
  }).then(model => ({
    ...model.dataValues,
    createdAt: moment(model.dataValues.createdAt).format('YYYY-MM-DD'),
    completedAt: moment(model.dataValues.completedAt).format('YYYY-MM-DD'),
    sprints: model.sprints ? model.sprints.map(sprint => sprint.dataValues) : null,
  }));

  const timeSheetsDbData = await Timesheet.findAll({
    where: queryParams,
    attributes: ['id', 'taskId', 'userId', 'comment', 'spentTime', 'onDate', 'typeId'],
    include: [
      {
        as: 'task',
        model: Task,
        required: false,
        attributes: ['id', 'name', 'plannedExecutionTime', [
          sequelize.literal(`(SELECT sum(tsh.spent_time)
          FROM timesheets AS tsh
          WHERE tsh.task_id = "Timesheet"."task_id")`), 'factExecutionTime'], 'projectId', 'typeId', 'sprintId'],
        paranoid: false,
      },
      {
        as: 'user',
        model: User,
        required: false,
        attributes: [
          'id',
          [withSuffix('first_name', lang), 'firstName'],
          [withSuffix('last_name', lang), 'lastName'],
          [withSuffix('full_name', lang), 'fullName'],
        ],
        paranoid: false,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            where: { projectId: queryParams.projectId },
            attributes: ['id', 'rolesIds'],
            paranoid: false,
            include: [
              {
                as: 'roles',
                model: ProjectUsersRoles,
              },
            ],
          },
        ],
      },
    ],
    order: [
      [{ model: User, as: 'user' }, withSuffix('full_name', lang), 'ASC'],
      ['onDate', 'ASC'],
    ],
  });
  // Подгрузка словарей из БД
  const projectRolesValues = await ProjectRolesDictionary.findAll();
  const taskTypesValues = await TaskTypesDictionary.findAll();

  const timeSheets = timeSheetsDbData.map(timeSheet => {
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

    data.task.typeName = data.task.typeId ? getTaskTypeName(data.task.typeId, taskTypesValues, lang) : null;
    return data;
  });

  const data = {
    info: { project, range: { startDate, endDate }, label },
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
    byUser: divideTimeSheetsBySprints(project, timeSheets, endDate),
  };

  return {
    workbook: generateExcellDocument(data, { lang }),
    options: {
      fileName: `${project.name} - ${criteria ? (startDate + ' - ' + endDate) : locale.FOR_ALL_THE_TIME} - ${lang}`,
    },
  };
};

exports.getCompanyReport = async function (criteria, options) {
  const { lang = 'en' } = options || {};
  let startDate;
  let endDate;
  const locale = i18n[lang];

  const timesheetTypes = await TimesheetTypesDictionary.findAll();
  if (criteria) {
    const validCriteria = validateCriteria(criteria);
    startDate = validCriteria.startDate;
    endDate = validCriteria.endDate;
  }

  const timeSheetsDbData = await listProjectByTimeSheets(startDate, endDate);
  // Подгрузка словарей из БД
  const projectRolesValues = await ProjectRolesDictionary.findAll();
  const taskTypesValues = await TaskTypesDictionary.findAll();

  const users = await User.findAll({
    where: {
      employment_date: {
        $lte: endDate,
      },
      delete_date: {
        $or: [{$gt: startDate}, {$eq: null}],
      },
    },
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

  const departmentList = await Department.findAll({
    where: {
      created_at: {
        $lte: startDate,
      },
      id: {
        $notIn: [25, 26],
      },
    },
  });

  const citiesList = await Department.findAll({
    where: {
      created_at: {
        $lte: startDate,
      },
      is_office: 1,
    },
    attributes: [
      'id',
      'name',
      'is_office',
    ],
  });
  citiesList.push({
    id: 'OTHER',
    name: 'OTHER',
  });

  // eslint-disable-next-line no-unused-vars
  const withUserDeleteDate = timeSheetsDbData
    .filter(timeSheet => timeSheet.dataValues.user.dataValues.delete_date !== null);
  const timeSheets = timeSheetsDbData
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

  const data = {
    info: { range: { startDate, endDate } },
    companyByUser: transformToUserList(timeSheets, lang),
    users,
    departmentList,
    citiesList,
  };

  const averageNumberOfEmployees = await getAverageNumberOfEmployees(
    startDate,
    endDate,
    {
      precision: 1,
    }
  );
  // employment_date

  return {
    workbook: generateCompanyReportExcellDocument(data, {
      lang,
      averageNumberOfEmployees,
    }),
    options: {
      fileName: `Report - ${criteria ? (startDate + ' - ' + endDate) : locale.FOR_ALL_THE_TIME} - ${lang}`,
    },
  };
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

function generateMessage (errors) {
  const incorrectParams = errors
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `Incorrect params - ${incorrectParams}`;
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

function withSuffix (baseField, lang) {
  return baseField + '_' + lang;
}
