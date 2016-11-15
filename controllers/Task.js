'use strict';

let router = require('koa-router')();

let Task = require('../models/Task');

router.get('/:taskId?', function *() {
  if (this.params.taskId !== '{taskId}') {
    let task = yield Task.find({
      id: this.params.taskId,
      owner_id: this.request.user.id,
      populate: this.request.query.populate
    });
    if (!task) this.throw(404, 'Task not found');

    this.body = task;
    return;
  }

  let tasks = yield Task.findAll({
    owner_id: this.request.user.id,
    populate: this.request.query.populate
  });

  this.body = tasks;
});

module.exports = router;
