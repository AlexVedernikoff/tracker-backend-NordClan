const createError = require('http-errors');
const _ = require('underscore');

const globalGrants = {
  user: {
    project: {
      'create': { granted: true, attributes: ['*'] },
      'read':  { granted: true, attributes: ['*'] },
      'update':  { granted: true, attributes: ['*'] },
      'delete':  { granted: false, attributes: ['*'] },
    }
  },
};

exports.routAccess = (resource, action, attributes) => {
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
