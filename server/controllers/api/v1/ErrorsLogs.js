const createError = require('http-errors');
const ErrorLogsService = require('../../../services/errorsLogs');

exports.log = async function (req, res, next) {

  const user = req.user;
  const {location, error, componentStack, state} = req.body;

  if (!location) {
    return next(createError(400, 'No location'));
  }

  if (!error) {
    return next(createError(400, 'No error'));
  }

  ErrorLogsService.create({
    userId: user.id, location, error, componentStack, state,
  });
};
