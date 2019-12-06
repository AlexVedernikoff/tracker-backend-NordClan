const ldap = require('ldapjs');
const URL = process.env.LDAP_URL;
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
      try {
        const user = Object.assign({}, defaulteUser);
        for (const key in data) {
          if (user[key] && data[key] && data[key] !== '') {
            user[key] = data[key];
          }
        }
        for (const k in user) {
          if (user[k] === '') {
            delete user[k];
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
        user.userPassword = data.password;
        client.add(`uid=${uid},dc=nordclan`, user, (err) => {
          if (err) {
            reject(null);
          } else {
            resolve(true);
          }
        });

      } catch (error) {
        console.log('catch err Ldap ====>', error);
        reject(null);
      }
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
  },

  modify (data, oldUid) {
    return new Promise((resolve, reject) => {
      try {
        const changeCity = new ldap.Change({
          operation: 'replace',
          modification: {
            city: data.city
          }
        });

        const changeLastNameEn = new ldap.Change({
          operation: 'replace',
          modification: {
            lastNameEn: data.lastNameEn
          }
        });

        const changeFirstNameEn = new ldap.Change({
          operation: 'replace',
          modification: {
            firstNameEn: data.firstNameEn
          }
        });

        const changeGivenName = new ldap.Change({
          operation: 'replace',
          modification: {
            givenName: data.lastNameRu
          }
        });

        const changeSn = new ldap.Change({
          operation: 'replace',
          modification: {
            sn: `${data.firstNameRu} ${data.lastNameRu}`
          }
        });

        const changeСn = new ldap.Change({
          operation: 'replace',
          modification: {
            cn: `${data.firstNameRu} ${data.lastNameRu}`
          }
        });

        client.modify(`uid=${oldUid},dc=nordclan`,
          [ changeLastNameEn,
            changeFirstNameEn,
            changeGivenName,
            changeСn,
            changeSn,
            changeCity
          ], function (err) {
            if (err) {
              console.log('Error user Add LDAP', err);
              reject(err);
            } else {
              resolve(true);
            }
          });

      } catch (error) {
        console.log('catch err Ldap ====>', error);
        reject(null);
      }
    });
  }
};

