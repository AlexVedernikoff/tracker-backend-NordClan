const ldap = require('ldapjs');
const URL = process.env.LDAP_URL_DEV;
const LOGIN = process.env.LDAP_LOGIN;
const PASSW = process.env.LDAP_PASSW;
const client = ldap.createClient({
  url: URL
});

client.bind(LOGIN, PASSW, err => {
  console.log('Error Client bind LDAP', err);
});

module.exports.LDAP = {
  create (req, res, next) {
    const data = { ...req.body };
    client.add('cn=foo, o=example', data, err => {
      if (err) {
        console.log('Error user Add LDAP', err);
        next(err);
      } else {
        next();
      }
    });
  },
  compare (req, res, next) {
    client.compare('cn=foo, o=example', 'sn', 'bar', (err, matched) => {
      if (err) {
        console.log('Error user Add LDAP', err);
        next(err);
      } else {
        console.log('matched: ' + matched);
        next();
      }
    });
  },
  delete (req, res, next) {
    client.del('cn=foo, o=example', (err) => {
      if (err) {
        console.log('Error user Add LDAP', err);
        next(err);
      } else {
        next();
      }
    });
  }
};

