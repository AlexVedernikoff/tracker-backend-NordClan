const { userAuthExtension } = require('./userAuthExtension');
/**
 * Устанавливаю методы и свойства для работы с правами в контроллерах
 */
exports.middleware = function (req, res, next) {
  if (!req.user && !req.isSystemUser) {
    return next();
  }

  req.user = userAuthExtension(req.user, req.isSystemUser);

  //TODO зачем это удалять?
  if (!req.isSystemUser) {
    delete req.user.dataValues.token;
    delete req.user.dataValues.authorsProjects;
    delete req.user.dataValues.usersProjects;
  }

  return next();
};
