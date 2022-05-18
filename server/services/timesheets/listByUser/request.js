const models = require('../../../models');

exports.getAllTimesheetsByUser = function (userId) {
  return {
    where: {
      id: userId,
    },
    attributes: ['id', 'firstNameRu', 'lastNameRu', 'fullNameEn', 'fullNameEn', 'lastNameEn', 'firstNameEn', 'employmentDate', 'delete_date', 'active', 'global_role'],
    include: [
      {
        model: models.Timesheet,
        as: 'timesheet',
        required: false,
        paranoid: false,
        attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], [models.sequelize.literal('to_char(Timesheet.updated_at, \'YYYY-MM-DD\')'), 'updatedAt'], 'typeId', 'taskId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'projectId', 'approvedByUserId'],
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
      required: false,
      attributes: ['id', 'firstNameRu', 'lastNameRu', 'lastNameEn', 'firstNameEn', 'active', 'employment_date', 'delete_date'],
      paranoid: false,
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
