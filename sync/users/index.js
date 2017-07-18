const ldap = require('./ldap');
const ps = require('./ps');

(function() {
  ldap()
    .then(() => {
      return ps();
    })
    .catch((err) => {
      console.error(err);
    });
})();
