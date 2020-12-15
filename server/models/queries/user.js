const models = require('../');

exports.name = 'user';

exports.findAllGlobalAdmin = function () {
  return models.User.findAll({
    where: {
      globalRole: 'ADMIN',
    },
    attributes: ['id'],
  });
};

exports.findAllDevOps = function () {
  return models.User.findAll({
    where: {
      globalRole: 'DEV_OPS',
    },
    attributes: ['id'],
  });
};
