const ldap = require('ldapjs');
const URL = 'ldap://ldap-test.nordclan:389/dc=nordclan';
// const URL = process.env.LDAP_URL_DEV;
const LOGIN = process.env.LDAP_LOGIN;
const PASSW = process.env.LDAP_PASSW;
const client = ldap.createClient({ url: URL });

const defaulteUser = {
  // dc: 'nordclan',
  active:	true,
  birthday: '',
  city: 'Ульяновск',
  cn: '',	//Роман Хмуренко
  emailPrimary: '', //roman.khmurenko@nordclan.com
  emailSecondary: '', //paraplanru@gmail.com
  firstNameEn: '',	//Роман
  gecos: '',
  gidNumber: 100, //100
  givenName: '',	//Роман
  homeDirectory: '',	// /home/roman.khmurenko
  jpegPhoto: '',	// http://nas.nordclan:8080/roman.khmurenko.jpg
  lastNameEn: '',	//Khmurenko
  loginShell: '/bin/sh', //	/bin/sh
  mail: '',	//roman.khmurenko@nordclan.com
  mobile: '',	// +79994623272
  objectClass: ['posixAccount', 'shadowAccount', 'person', 'inetOrgPerson', 'nordclanClass'],
  shadowLastChange: '',	//18155
  skype:	'',
  sn: '',	//Роман Хмуренко
  telephoneNumber:	'', //000000
  uid: '', 	// roman.khmurenko
  uidNumber: '',	//1021
  userPassword: ''	//{crypt}IJ5chaaEYDNLk
};

client.bind(`${'cn=admin,dc=nordclan'}`, '123123', (err) => {
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

