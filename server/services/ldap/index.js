const ldap = require('ldapjs');
const crypto = require('crypto');
const _ = require('lodash');
const moment = require('moment');

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

  searchUser (uid) {
    return new Promise((resolve, reject) => {
      client.search(`uid=${uid},dc=nordclan`, { }, (err, res) => {
        if (err) reject(err);
        res.on('searchEntry', function (entry) {
          resolve(entry.object);
        });
        res.on('searchReference', function () {
          reject(null);
        });
        res.on('error', function (resErr) {
          reject(resErr);
        });
        res.on('end', function () {
          reject(null);
        });
      });
    });
  },


  modify (uid, oldData, newData) {

    console.log(newData);

    function addDataToArray (array, field, value, defaultValue = '') {
      const newVal = (value || defaultValue).toString();
      if (!(field in oldData)) {
        console.log(`add [${field}]: ${newVal}`);
        array.push(new ldap.Change({
          operation: 'add',
          modification: {
            [field]: newVal
          }
        }));
      } else if (!_.isEqual(oldData[field].toString(), newVal)) {
        console.log(`change [${field}]: ${newVal}`);
        array.push(new ldap.Change({
          operation: 'replace',
          modification: {
            [field]: newVal
          }
        }));
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const updateDataArray = [];
        const sn = `${newData.firstNameRu || ' '} ${newData.lastNameRu || ' '}`;
        addDataToArray(updateDataArray, 'sn', sn);
        addDataToArray(updateDataArray, 'cn', sn);
        addDataToArray(updateDataArray, 'city', newData.city);
        addDataToArray(updateDataArray, 'lastNameEn', newData.lastNameEn);
        addDataToArray(updateDataArray, 'firstNameEn', newData.firstNameEn);
        addDataToArray(updateDataArray, 'givenName', newData.lastNameRu);
        addDataToArray(updateDataArray, 'emailPrimary', newData.emailPrimary);
        addDataToArray(updateDataArray, 'mail', newData.emailPrimary);
        addDataToArray(updateDataArray, 'jpegPhoto', newData.photo);
        addDataToArray(updateDataArray, 'uidNumber', newData.id);
        const homeDirectory = `/home/${newData.firstNameEn.toLowerCase()}.${newData.lastNameEn.toLowerCase()}`;
        addDataToArray(updateDataArray, 'homeDirectory', homeDirectory);
        addDataToArray(updateDataArray, 'telegram', newData.telegram);
        addDataToArray(updateDataArray, 'company', newData.company);
        addDataToArray(updateDataArray, 'objectClass', defaultUser.objectClass);
        addDataToArray(updateDataArray, 'allowVPN', newData.allowVPN, false);

        if (newData.employmentDate) {
          const employmentDate = moment(newData.employmentDate).format('YYYYMMDD000000.000\\Z');
          addDataToArray(updateDataArray, 'firstDay', employmentDate, '');
        }

        if (newData.deleteDate) {
          const deleteDate = moment(newData.deleteDate).format('YYYYMMDD000000.000\\Z');
          addDataToArray(updateDataArray, 'lastDay', deleteDate, '');
        }


        if (newData.active === 0) {
          addDataToArray(updateDataArray, 'active', 'false');
          addDataToArray(updateDataArray, 'userPassword', crypto.randomBytes(50).toString('hex'));
        }

        console.log(updateDataArray);

        if (updateDataArray.length > 0) {
          client.modify(`uid=${uid},dc=nordclan`, updateDataArray, function (err) {
            if (err) {
              console.log('Error user Add LDAP', err);
              reject(err);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }

      } catch (error) {
        console.log('catch err Ldap ====>', error);
        reject(null);
      }
    });
  }
};
