const models = require('../../../models');
const { TIMESHEET_USER_TYPE_FILTER, USER_GLOBAL_ROLES } = require('../../../../common/constants')

const getAllTimesheetsByUser = function (dateBegin, dateEnd, projectId, isSystemUser) {
  const where = {};

  if (projectId) {
    where.projectId = projectId;
  }

  if (dateBegin && dateEnd) {
    where.onDate = {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd,
      },
    };
  }

  if (isSystemUser) {
    where.spentTime = {
      gt: 0,
    };
  }
  return {
    attributes: [
      'id',
      'firstNameRu',
      'lastNameRu',
      'fullNameEn',
      'fullNameEn',
      'lastNameEn',
      'firstNameEn',
      'employmentDate',
      'delete_date',
      'active',
      'global_role'
    ],
    where: { externalUserType: { $not: 'Client' } },
    include: [
      {
        model: models.Timesheet,
        as: 'timesheet',
        required: !!projectId,
        paranoid: false,
        attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], [models.sequelize.literal('to_char(Timesheet.updated_at, \'YYYY-MM-DD\')'), 'updatedAt'], 'typeId', 'taskId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'projectId', 'approvedByUserId'],
        where,
        include: getInclude(),
        order: [
          ['onDate', 'ASC'],
        ],
      },
      {
        model: models.Department,
        as: 'department',
        required: false,
        attributes: ['name', 'id'],
        through: {
          model: models.UserDepartments,
          attributes: [],
        },
      },
    ],
    order: [
      ['lastNameRu', 'ASC'],
    ],
  };
};

const listByTimeSheets = function ({dateBegin, dateEnd, projectId, statusId, isSystemUser}) {
  const where = {};

  if (projectId) {
    if (Array.isArray(projectId)) {
      where.projectId = { $in: projectId }
    } else {
      where.projectId = projectId;
    }
  }

  if (dateBegin && dateEnd) {
    where.onDate = {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd,
      },
    };
  }

  if (isSystemUser) {
    where.spentTime = {
      gt: 0,
    };
  }

  if (Array.isArray(statusId) && statusId.length) {
    where.statusId = { $in: statusId }
  }

  return {
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'projectId'],
    where,
    include: getInclude(),
    order: [
      ['onDate', 'ASC'],
    ],
  };
};

const listByParameters = function (params) {
  const result = listByTimeSheets({
    dateBegin: params.startDate,
    dateEnd: params.endDate,
    projectId: params.projectId,
    isSystemUser: params.isSystemUser,
    statusId: params.statusFilter
  })

  const extraFilters = {};

  if (params.userTypeFilter === TIMESHEET_USER_TYPE_FILTER.EXTERNAL_USER) {
    extraFilters.user = {
      global_role: USER_GLOBAL_ROLES.EXTERNAL_USER
    };
  } else if (params.userTypeFilter === TIMESHEET_USER_TYPE_FILTER.NOT_EXTERNAL_USER) {
    extraFilters.user = {
      global_role: { $not: USER_GLOBAL_ROLES.EXTERNAL_USER }
    };
  }

  let userFilter = [];
  if (params.departmentFilter.length > 0) {
    const filter = `(SELECT user_id FROM user_departments WHERE user_departments.department_id in (${params.departmentFilter.join(', ')}))`
    userFilter.push({ id: { $in: models.sequelize.literal(filter) } });
  }

  if (params.userFilter.length > 0) {
    userFilter.push({ id: { $in: params.userFilter } });
  }

  if (userFilter.length > 0) {
    extraFilters.user = {
      ...(extraFilters.user || {}),
      $and: userFilter
    }
  }

  return {
    ...result,
    include: getInclude(extraFilters),
  }
};

function getInclude(filters) {
  const include = [
    {
      as: 'task',
      model: models.Task,
      required: false,
      attributes: ['id', 'name', 'typeId'],
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
          as: 'sprint',
          model: models.Sprint,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false,
        },
      ],
    },
    {
      as: 'project',
      model: models.Project,
      required: false,
      attributes: ['id', 'name', 'prefix'],
      paranoid: false,
    },
    {
      as: 'sprint',
      model: models.Sprint,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false,
    },
    {
      as: 'user',
      model: models.User,
      attributes: ['id', 'firstNameRu', 'lastNameRu', 'lastNameEn', 'firstNameEn', 'active', 'employment_date', 'delete_date', "global_role"],
      paranoid: false,
      where: filters ? filters.user : undefined,
      include: [
        {
          as: 'department',
          model: models.Department,
          attributes: ['name'],
          paranoid: false,
        },
      ],
    },
  ];

  return include;
}

module.exports = {
  listByParameters,
  listByTimeSheets,
  getAllTimesheetsByUser
}
