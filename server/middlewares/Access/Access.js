const _ = require('underscore');
const global = require('./global');
const project = require('./project');

exports.global = global;
//exports.project = project;

exports.middleware = function (req, res, next) {


  req.user.Access = {
    global,
    project: project(req.user)
  };

  next();
};
