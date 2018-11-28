const models = require('../');
const createError = require('http-errors');

exports.name = 'user';

exports.findOneActiveUser = function (userId, attributes = ['id'], t) {
  return models.User
    .findOne({where: {
      id: userId,
      active: 1
    }, attributes: attributes, transaction: t})
    .then((user) => {
      if (!user) throw createError(404, 'User not found');
      return user;
    });

};

exports.findAllGlobalAdmin = function () {
  return models.User.findAll({
    where: {
      globalRole: 'ADMIN'
    },
    attributes: ['id']
  });
};

exports.findAllDevOps = function () {
  return models.User.findAll({
    where: {
      globalRole: 'DEV_OPS'
    },
    attributes: ['id']
  });
};
