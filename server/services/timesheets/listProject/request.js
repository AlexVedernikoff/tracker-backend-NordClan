const models = require('../../../models');

exports.listByUser = function (dateBegin, dateEnd, projectId, isSystemUser) {
  const where = { };

  if (projectId) {
    where.projectId = projectId;
  }

  if (dateBegin && dateEnd) {
    where.onDate = {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    };
  }

  if (isSystemUser) {
    where.spentTime = {
      gt: 0
    };
  }

  return {
    attributes: ['id', 'firstNameRu', 'lastNameRu', 'lastNameEn', 'firstNameEn', 'employmentDate', 'dismissalDate', 'global_role'],
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
          ['onDate', 'ASC']
        ]
      },
      {
        model: models.Department,
        as: 'department',
        required: false,
        attributes: ['name', 'id'],
        through: {
          model: models.UserDepartments,
          attributes: []
        }
      }
    ],
    where: {
      active: 1
    },
    order: [
      ['lastNameRu', 'ASC']
    ]
  };
};

exports.listByTimeSheets = function (dateBegin, dateEnd, projectId, isSystemUser) {
  const where = { };

  if (projectId) {
    where.projectId = projectId;
  }

  if (dateBegin && dateEnd) {
    where.onDate = {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    };
  }

  if (isSystemUser) {
    where.spentTime = {
      gt: 0
    };
  }

  return {
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'taskId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'projectId'],
    where,
    include: getInclude(),
    order: [
      ['onDate', 'ASC']
    ]
  };
};


function getInclude () {
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
          paranoid: false
        },
        {
          as: 'sprint',
          model: models.Sprint,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false
        }
      ]
    },
    {
      as: 'project',
      model: models.Project,
      required: false,
      attributes: ['id', 'name', 'prefix'],
      paranoid: false
    },
    {
      as: 'sprint',
      model: models.Sprint,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false
    },
    {
      as: 'user',
      model: models.User,
      required: false,
      attributes: ['id', 'firstNameRu', 'lastNameRu', 'lastNameEn', 'firstNameEn', 'active', 'employment_date', 'delete_date'],
      paranoid: false
    }
  ];

  return include;
}
