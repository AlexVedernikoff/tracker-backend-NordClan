'use strict';

let router = require('koa-router')();

let Project = require('../models/pgProject');

router.get('/(:projectId)?', function *() {
    if (this.params.projectId) {
      yield Project.findById(this.params.projectId).then(function(project) {
        if (!project) this.throw(404, 'Project not found');
        this.body = project;
        return;
      });
    }

    yield Project.findAll().then(function(projects) {
      this.body = projects;
    });
  });

module.exports = router;
