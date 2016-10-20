'use strict';

let router = require('koa-router')();

let OAuth = require('../models/OAuth');

router.use('/auth', require('./Auth').routes());
router.use('/user', OAuth.authorize, require('./User').routes());
router.use('/task', OAuth.authorize, require('./Task').routes());
router.use('/project', OAuth.authorize, require('./Project').routes());
router.use('/comment', OAuth.authorize, require('./Comment').routes());

module.exports = router;
