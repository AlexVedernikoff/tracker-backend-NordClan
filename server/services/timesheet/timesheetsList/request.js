const models = require('../../../models');

module.exports = function (dateBegin, dateEnd, userId, userPSId, isSystemUser) {
  const where = {
    deletedAt: null,
    userId,
    onDate: {
      $and: {
        $gte: dateBegin,
        $lte: dateEnd
      }
    }
  };

  if (isSystemUser) {
    where.spentTime = {
      gt: 0
    };
  }

  return {
    where,
    include: getInclude(userId, userPSId)
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
        }
      ]
    },
    {
      as: 'project',
      model: models.Project,
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
