'use strict';

let router = require('koa-router')();

let OAuth = require('../models/OAuth');

router.use('/auth', require('./Auth').routes());
router.use('/user', OAuth.authorize, require('./User').routes());
router.use('/task', OAuth.authorize, require('./Task').routes());

module.exports = router;
