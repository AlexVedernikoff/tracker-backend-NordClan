'use strict';
const _ = require('underscore');
const global = require('./global');
const project = require('./project');

exports.global = global;

exports.middleware = function (req, res, next) {
  if (req.user) {
    req.user.Access = {
      global,
      project: project(req.user)
    };
  }
  next();
};
