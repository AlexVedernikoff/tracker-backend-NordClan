'use strict';
const _ = require('underscore');

exports.global = global;

exports.middleware = function (req, res, next) {
  // if (req.user) {
  //   req.user.Access = {
  //     global,
  //     project: project(req.user)
  //   };
  // }
  next();
};
