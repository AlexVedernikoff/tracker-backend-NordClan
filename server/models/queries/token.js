const moment = require('moment');
const Token = require('../').Token;

exports.name = 'token';

exports.deleteExpiredTokens = function (user) {
  return Token
    .destroy({
      where: {
        userId: user.id,
        expires: {
          $lt: moment().format(), // expires < now
        },
      },
    });
};
