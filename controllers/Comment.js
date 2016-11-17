'use strict';

let router = require('koa-router')();

let Comment = require('../models/Comment');

router.get('/:commentId', function *() {
  if (this.params.commentId) {
    let comment = yield Comment.find({ id: this.params.commentId, populate: this.request.query.populate });
    if (!comment) this.throw(404, 'Comment not found');
    this.body = comment;
  }
});

router.put('/:commentId', function *() {
  if (this.params.commentId) {
    let comment = yield Comment.find({ id: this.params.commentId });
    if (!comment) this.throw(404, 'Comment not found');
    comment = yield comment.setData(this.request.fields).save();
    this.body = comment;
  }
});

router.post('/', function *() {
  if (!this.request.fields.user) this.request.fields.user = this.request.user;
  let comment = yield new Comment().setData(this.request.fields).save();
  if (!comment) this.throw(500, 'Error on save comment');
  this.body = comment;
});

router.delete('/:commentId', function *() {
  if (this.params.commentId) {
    let comment = yield Comment.find({ id: this.params.commentId });
    yield comment.remove();
    this.body = '';
  }
});

module.exports = router;
