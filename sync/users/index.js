const ldap = require('./ldap');
const ps = require('./ps');

/*
* crontab
* 0 12 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/sync/users/index.js 2>&1
* */

(function() {
  ldap()
    .then(() => {
      return ps();
    })
    .catch((err) => {
      console.error(err);
    });
})();
