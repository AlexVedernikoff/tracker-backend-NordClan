const createError = require('http-errors');
const models = require('../../../models');

exports.healthcheck = function (req, res, next){
  models.sequelize.query('SELECT 1 + 1 FROM users')
    .then(() => {
      res.json();
    })
    .catch((err) => {
      next(createError(err));
    });
};
