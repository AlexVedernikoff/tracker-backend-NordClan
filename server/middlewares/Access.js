const createError = require('http-errors');
const _ = require('underscore');


const globalGrants = {
  user: {
    project: {
      'create': { granted: true, attributes: ['*'] },
      'read':  { granted: true, attributes: ['*'] },
      'update':  { granted: true, attributes: ['*'] },
      'delete':  { granted: false, attributes: ['*'] },
      //
      // 'create:own': { granted: true, attributes: ['*'] },
      // 'read:own':  { granted: true, attributes: ['*'] },
      // 'update:own':  { granted: false, attributes: ['*'] },
      // 'delete:own':  { granted: false, attributes: ['*'] },
    }
  },
  admin: {
    video: {
      'create:any': ['*', '!views'],
      'read:any': ['*'],
      'update:any': ['*', '!views'],
      'delete:any': ['*']
    }
  },
};

const projectGrants = {
  user: {
    project: {
      'read:own':  { granted: true, attributes: ['*'] },
      'update:own':  { granted: true, attributes: ['*'] },
      'delete:own':  { granted: false, attributes: ['*'] },
      //
      // 'create:own': { granted: true, attributes: ['*'] },
      // 'read:own':  { granted: true, attributes: ['*'] },
      // 'update:own':  { granted: false, attributes: ['*'] },
      // 'delete:own':  { granted: false, attributes: ['*'] },
    }
  },
  admin: {
    project: {
      'create': { granted: true, attributes: ['*'] },
      'read':  { granted: true, attributes: ['*'] },
      'update':  { granted: true, attributes: ['*'] },
      'delete':  { granted: false, attributes: ['*'] },
      //
      // 'create:own': { granted: true, attributes: ['*'] },
      // 'read:own':  { granted: true, attributes: ['*'] },
      // 'update:own':  { granted: false, attributes: ['*'] },
      // 'delete:own':  { granted: false, attributes: ['*'] },
    }
  },
};



exports.middleware = function (req, res, next) {
  req.user.can = (resource, action, projectId) => {
    const grants = _.find(req.user.projects, (obj) => {
      return obj.projectId === projectId;
    });
    console.log(grants);
    console.log(req.user.projects);
  };
  next();
};

const can = (resource, action, attributes) => {
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

exports.can = can;
