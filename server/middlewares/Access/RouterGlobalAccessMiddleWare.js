const createError = require('http-errors');
const globalGrants = require('./globalGrants');

//Блокирую доступ к роутам на глобальном уровне
exports.can = (resource, action) => {
  return (req, _res, next) => {
    try {
      const role = req.user.globalRole;
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', role);
      const permission = getPermission(role, resource, action);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..', permission);
      if (permission) {
        return next();
      }
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
  return false;
}
