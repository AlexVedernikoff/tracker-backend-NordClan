const models = require('../../../models');

module.exports = function (dateBegin, dateEnd, taskId, userId, userPSId, isSystemUser) {
  const where = {
    onDate: {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    }
  };

  if (userId && !userPSId) {
    where.userId = userId;
  }

  if (isSystemUser) {
    where.spentTime = {
      gt: 0
    };
  }

  if (taskId) {
    where.taskId = taskId;
  }

  return {
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillable', 'userRoleId', 'taskStatusId', 'statusId', 'userId'],
    where,
    include: getInclude(userId, userPSId),
    order: [
      ['createdAt', 'ASC']
    ]
  };
};


function getInclude (userId, userPSId) {
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
    }
  ];

  if (userPSId && !userId) {
    include.push({
      as: 'user',
      model: models.User,
      required: true,
      attributes: [],
      paranoid: false,
      where: {
        psId: userPSId
      }
    });
  }

  return include;
}
