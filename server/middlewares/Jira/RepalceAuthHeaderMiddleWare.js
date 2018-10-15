const createError = require('http-errors');

//Блокирую доступ к роутам на глобальном уровне
exports.replaceAuthHeader = () => {
  return (req, res, next) => {
    if (req.headers['x-jira-auth']) {
      req.headers.authorization = req.headers['x-jira-auth'];
      return next();
    }
    return next(createError(403, 'Access denied'));
  };
};
