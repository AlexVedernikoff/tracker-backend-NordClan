const ldap = require('ldapjs');
const URL = process.env.LDAP_URL;
const LOGIN = process.env.LDAP_LOGIN;
const PASSW = process.env.LDAP_PASSW;
const client = ldap.createClient({ url: URL });

const defaultUser = {
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
  objectClass: ['posixAccount', 'shadowAccount', 'person', 'inetOrgPerson', 'nordclanClass', 'vpnClass'],
  shadowLastChange: '',
  skype:	'',
  sn: '',
  telephoneNumber:	'',
  uid: '',
  uidNumber: '',
  userPassword: '',
  allowVPN: true
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
        const user = Object.assign({}, defaultUser);
        for (const key in data) {
          if (typeof user[key] === 'boolean' || (user[key] && data[key] && data[key] !== '')) {
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

    function updateData (fileld) {
      return new ldap.Change({
        operation: 'replace',
        modification: fileld
      });
    }

    return new Promise((resolve, reject) => {
      try {
        const changeCity = updateData({city: data.city || ' '});
        const changeLastNameEn = updateData({lastNameEn: data.lastNameEn || ' '});
        const changeFirstNameEn = updateData({firstNameEn: data.firstNameEn || ' '});
        const changeGivenName = updateData({givenName: data.lastNameRu || ' '});
        const changeSn = updateData({sn: `${data.firstNameRu} ${data.lastNameRu || ' '}`});
        const changeCn = updateData({cn: `${data.firstNameRu} ${data.lastNameRu || ' '}`});
        const emailPrimary = updateData({emailPrimary: `${data.emailPrimary || ' '}`});
        const mail = updateData({emailPrimary: `${data.emailPrimary || ' '}`});

        const jpegPhoto = updateData({jpegPhoto: data.photo || ''});
        const uidNumber = updateData({uidNumber: `${data.id || ''}`});
        const homeDirectory = updateData({homeDirectory: `/home/${data.firstNameEn.toLowerCase()}.${data.lastNameEn.toLowerCase()}`});

        const changeObjectClass = updateData({ objectClass: defaultUser.objectClass });
        const changeAllowVPN = updateData({ allowVPN: data.allowVPN });

        client.modify(`uid=${oldUid},dc=nordclan`,
          [ changeLastNameEn,
            changeFirstNameEn,
            changeGivenName,
            changeCn,
            changeSn,
            changeCity,
            emailPrimary,
            mail,
            jpegPhoto,
            uidNumber,
            homeDirectory,
            changeObjectClass,
            changeAllowVPN
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
