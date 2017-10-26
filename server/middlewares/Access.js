const grantsObject = {
  admin: {
    video: {
      'create:any': ['*', '!views'],
      'read:any': ['*'],
      'update:any': ['*', '!views'],
      'delete:any': ['*']
    }
  },
  user: {
    video: {
      'create:own': ['*', '!rating', '!views'],
      'read:own': ['*'],
      'update:own': ['*', '!rating', '!views'],
      'delete:own': ['*']
    }
  }
};

exports.middleware = function () {

};

exports.can = function (resource, action, attribute) {
  return (req, res, next) => {
    next();
    return grantsObject[req.user.golbalRole][resource][action];
  };
};