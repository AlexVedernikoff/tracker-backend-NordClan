const models = require('../');
const createError = require('http-errors');

exports.name = 'user';

exports.findOneActiveUser = function(userId, attributes = ['id'], t) {
  return models.User
    .findOne({where: {
      id: userId,
      active: 1,
    }, attributes: attributes, transaction: t})
    .then((user) => {
      if(!user) throw createError(404, 'User not found');
      return user;
    });

};

