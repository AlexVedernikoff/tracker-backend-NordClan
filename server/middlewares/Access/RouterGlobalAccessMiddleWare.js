const createError = require('http-errors');
const globalGrants = require('./globalGrants');

//Блокирую доступ к роутам на глобальном уровне
exports.can = (resource, action) => {
  return (req, res, next) => {
    try {
      const permission = getPermission(req.user.globalRole, resource, action);
      if (permission.granted) return next();
      return next(createError(403, 'Access denied'));
    } catch (e) {
      return next(createError(e));
    }
  };
};

function getPermission (role, resource, action) {
  if (
    globalGrants[role]
    && globalGrants[role][resource]
    && globalGrants[role][resource][action]
  ) {
    return globalGrants[role][resource][action];
  }
  return { granted: false };
}
