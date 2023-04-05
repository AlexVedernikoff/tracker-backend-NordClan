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
  sequelize,
} = require('../../../models');
const _ = require('lodash');
const moment = require('moment');
const { listProjectByTimeSheets, listProjectByParameters } = require('../../timesheets/listProject/index.js');
const i18n = require('./i18n.json');
const { getAverageNumberOfEmployees, getTaskTypeName, getProjectRoleName,
  withSuffix, filterTimesheets, getUserListFromDB, generateUserReportExcellDocument, transformToUserList,
  validateCriteria, generateCompanyReportExcellDocument, generateExcellDocument, divideTimeSheetsBySprints,
} = require('../utils');

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
  const {
    userTypeFilter,
    projectFilter,
    departmentFilter,
    userFilter,
    statusFilter,
  } = criteria;
  let startDate;
  let endDate;
  const locale = i18n[lang];

  const timesheetTypes = await TimesheetTypesDictionary.findAll();
  if (criteria) {
    const validCriteria = validateCriteria(criteria);
    startDate = validCriteria.startDate;
    endDate = validCriteria.endDate;
  }

  const timeSheetsDbData = await listProjectByParameters({
    startDate,
    endDate,
    userTypeFilter,
    projectId: projectFilter,
    departmentFilter,
    userFilter,
    statusFilter
  });
  // Подгрузка словарей из БД
  const projectRolesValues = await ProjectRolesDictionary.findAll();
  const taskTypesValues = await TaskTypesDictionary.findAll();

  const users = await getUserListFromDB({
    active: 1,
    allow_vpn: true,
    globalRole: { $not: User.EXTERNAL_USER_ROLE },
  });
  const departmentList = await Department.findAll({
    where: {
      created_at: {
        $lte: startDate,
      },
      type: 'department',
    },
  });

  const citiesList = await Department.findAll({
    where: {
      created_at: {
        $lte: startDate,
      },
      type: 'office',
    },
    attributes: [
      'id',
      'name',
    ],
  });


  const timeSheets = filterTimesheets(timeSheetsDbData, timesheetTypes, projectRolesValues, lang, taskTypesValues);
  const data = {
    info: { range: { startDate, endDate } },
    companyByUser: transformToUserList(timeSheets, lang),
    users,
    departmentList,
    citiesList: citiesList.reverse(),
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

exports.getUserReport = async function (criteria, options) {
  const { lang = 'en' } = options || {};
  let startDate;
  let endDate;
  const locale = i18n[lang];
  const userId = options.userId;

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

  const users = await getUserListFromDB({
    id: userId,
  });

  const departmentList = await Department.findAll({
    where: {
      created_at: {
        $lte: startDate,
      },
      type: 'department',
    },
  });

  const timeSheets = filterTimesheets(timeSheetsDbData, timesheetTypes, projectRolesValues, lang, taskTypesValues);
  const data = {
    info: { range: { startDate, endDate } },
    companyByUser: transformToUserList(timeSheets, lang).filter(u=>u.user.id === Number(userId)),
    users,
    departmentList,
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
    workbook: generateUserReportExcellDocument(data, {
      lang,
      averageNumberOfEmployees,
    }),
    options: {
      fileName: `Report - ${criteria ? (startDate + ' - ' + endDate) : locale.FOR_ALL_THE_TIME} - ${lang}`,
    },
  };
};
