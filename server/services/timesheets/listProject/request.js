const models = require('../../../models');

module.exports = function (dateBegin, dateEnd, projectId, isSystemUser) {
  const where = {};

  if (dateBegin && dateEnd) {
    where.onDate = {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    };
  }

  where.projectId = projectId;

  if (isSystemUser) {
    where.spentTime = {
      gt: 0
    };
  }

  return {
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'projectId'],
    where,
    include: getInclude(),
    order: [
      ['createdAt', 'ASC']
    ]
  };
};


function getInclude () {
  const include = [
    {
      as: 'task',
      model: models.Task,
      required: false,
      attributes: ['id', 'name'],
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
      attributes: ['id', 'firstNameRu', 'lastNameRu'],
      paranoid: false
    }
  ];

  return include;
}
