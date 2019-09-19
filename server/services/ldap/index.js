const ldap = require('ldapjs');
const URL = process.env.LDAP_URL_DEV;
const LOGIN = process.env.LDAP_LOGIN;
const PASSW = process.env.LDAP_PASSW;
const client = ldap.createClient({ url: URL });

const defaulteUser = {
  active:	true,
  birthday: '',
  city: 'Ульяновск',
  cn: '',
  emailPrimary: '',
  emailSecondary: '',
  firstNameEn: '',
  gecos: '',
  gidNumber: 100,
  givenName: '',
  homeDirectory: '',
  jpegPhoto: '',
  lastNameEn: '',
  loginShell: '/bin/sh',
  mail: '',
  mobile: '',
  objectClass: ['posixAccount', 'shadowAccount', 'person', 'inetOrgPerson', 'nordclanClass'],
  shadowLastChange: '',
  skype:	'',
  sn: '',
  telephoneNumber:	'',
  uid: '',
  uidNumber: '',
  userPassword: ''
};

client.bind(`cn=${LOGIN},dc=nordclan`, PASSW, (err) => {
  if (err) {
    console.log('Error Client bind LDAP', err);
  }
});

module.exports = {
  create (data) {
    return new Promise((resolve, reject) => {
      const user = Object.assign({}, defaulteUser);
      for (const key in data) {
        if (user[key] && data[key]) {
          user[key] = data[key];
        }
      }
      const uid = `${data.firstNameEn.toLowerCase()}.${data.lastNameEn.toLowerCase()}`;
      const cn = `${data.firstNameEn.toLowerCase()} ${data.lastNameEn.toLowerCase()}`;
      const photo = `http://nas.nordclan:8080/${uid}.jpg`;
      user.cn = cn;
      user.sn = `${data.firstNameRu} ${data.lastNameRu}`;
      user.emailPrimary = `${data.firstNameEn.toLowerCase()}.${data.lastNameEn.toLowerCase()}@nordclan.com`;
      user.mail = user.emailPrimary;
      user.firstNameEn = data.firstNameEn;
      user.lastNameEn = data.lastNameEn;
      user.jpegPhoto = photo;
      user.givenName = data.lastNameRu;
      user.uidNumber = data.uidNumber;
      user.city = data.city;
      user.homeDirectory = `/home/${data.firstNameEn.toLowerCase()}.${data.lastNameEn.toLowerCase()}`;
      user.uid = uid;
      user.userPassword = data.password || 'qwe123';
      delete user.birthday;
      delete user.mobile;
      delete user.shadowLastChange;
      delete user.skype;
      delete user.telephoneNumber;
      client.add(`uid=${uid},dc=nordclan`, user, (err) => {
        if (err) {
          console.log('Error user Add LDAP', err);
          reject(null);
        } else {
          resolve(true);
        }
      });
    });
  },

  //TODO: NOT USED
  compare (data) {
    return new Promise((resolve, reject) => {
      client.compare('cn=foo, o=example', 'sn', 'bar', (err, matched) => {
        if (err) {
          console.log('Error user Add LDAP', err);
          reject(err);
        } else {
          console.log('matched: ' + matched);
          resolve();
        }
      });
    });
  },
  //TODO: NOT USED
  delete (data) {
    return new Promise((resolve, reject) => {
      client.del('cn=foo, o=example', (err) => {
        if (err) {
          console.log('Error user Add LDAP', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

