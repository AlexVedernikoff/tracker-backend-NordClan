'use strict';

let router = require('koa-router')();

let Task = require('../models/Task');

router.get('/:taskId?', function *() {
  if (this.params.taskId) {
    let task = yield Task.find({
      id: this.params.taskId,
      owner_id: this.request.user.id,
      populate: this.request.query.populate // 14.11 - 15-50
    });
    if (!task) this.throw(404, 'Task not found');

    this.body = task;
    return;
  }

  let tasks = yield Task.findAll({
    owner_id: this.request.user.id,
    populate: 'owner author project'
  });

  this.body = tasks;
});

module.exports = router;
