'use strict';

let router = require('koa-router')();

let User = require('../models/User');
let PS = require('../models/PS');

router.get('/:username?', function *() {
  let { username = this.request.user.username } = this.params;
  let user = yield User.find({ username });

  if (!user) {
    let psUser = yield PS.getUser(username);

    if (!psUser.id) {
      this.throw(404, 'User not found');
    }

    user = new User();
    user.setData({
      username,
      firstname_ru: psUser.firstNameRu,
      lastname_ru: psUser.lastNameRu,
      firstname_en: psUser.firstNameEn,
      lastname_en: psUser.lastNameEn,
      email: psUser.emailPrimary,
      mobile: psUser.mobile,
      skype: psUser.skype,
      photo: psUser.photo,
      birthday: psUser.birthDate,
      ps_id: psUser.id,
    });

    user = yield user.save();
  }

  this.body = user;
});

router.get('/sync/:username?', function *() {
  let { username = this.request.user.username } = this.params;
  yield* PS.syncTasks(username);
  this.body = 'OK';
});

module.exports = router;
