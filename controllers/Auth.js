'use strict';

let router = require('koa-router')();

let OAuth = require('../models/OAuth');

router.post('/login', function *() {
  var oauth = new OAuth({ req: this.request });
  this.body = yield oauth.login();
});

router.post('/refresh', function *() {
  var oauth = new OAuth({ req: this.request });
  this.body = yield oauth.login(true);
});

router.get('/check', OAuth.authorize, function *() {
  this.body = this.request.user;
});

module.exports = router;
