'use strict';

let router = require('koa-router')();

let Task = require('../models/Task');

router.get('/(:taskId)?', function *() {
  if (this.params.taskId) {
    let task = yield Task.find({
      _id: this.params.taskId,
      owner: this.request.user._id,
      populate: 'owner author project'
    });

    this.body = task;
    return;
  }

  let tasks = yield Task.findAll({
    owner: this.request.user._id,
    populate: 'owner author project'
  });

  this.body = tasks;
});

module.exports = router;
