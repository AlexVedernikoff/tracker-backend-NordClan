'use strict';

let router = require('koa-router')();

let Project = require('../models/Project');

router.get('/:projectId?', function *() {
  if (this.params.projectId) {
    let project = yield Project.find({ id: this.params.projectId });
    if (!project) this.throw(404, 'Project not found');
    this.body = project;
    return;
  }

  let projects = yield Project.findAll({});
  this.body = projects;
});

module.exports = router;
