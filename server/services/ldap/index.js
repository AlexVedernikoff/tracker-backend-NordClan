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
  allowVPN: true,
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
        const sn = `${data.firstNameRu} ${data.lastNameRu}`;
        user.cn = cn;
        user.sn = sn;
        const emailPrimary = `${uid}@nordclan.com`;
        user.emailPrimary = emailPrimary;
        user.mail = emailPrimary;
        user.firstNameEn = data.firstNameEn;
        user.lastNameEn = data.lastNameEn;
        user.givenName = data.lastNameRu;
        user.uidNumber = data.uidNumber;
        user.homeDirectory = `/home/${uid}`;
        user.uid = uid;
        user.userPassword = data.password;
        if (data.city) user.city = data.city;
        if (data.telegram) user.telegram = data.telegram;
        if (data.company) user.company = data.company;
        if (data.allowVPN) user.allowVPN = data.allowVPN;
        if (data.deptNames) user.department = data.deptNames;
        if (data.employmentDate) {
          const employmentDate = moment(data.employmentDate).format('YYYYMMDD000000.000\\Z');
          user.firstDay = employmentDate;
        }


        client.add(`uid=${uid},dc=nordclan`, user, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });

      } catch (error) {
        console.log('LDAP: Create User Error (common catch): ', error);
        reject(null);
      }
    });
  },

  //TODO: NOT USED
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
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
          resolve(null);
        });
        res.on('error', function () {
          resolve(null);
        });
        res.on('end', function () {
          resolve(null);
        });
      });
    });
  },


  modify (uid, oldData, newData) {

    function addDataToArray (array, field, value, defaultValue = '') {
      const newVal = (value || defaultValue).toString();
      if (!(field in oldData)) {
        // Change if field not exist in LDAP and not empty
        if (!_.isEqual(newVal, '')) {
          array.push(new ldap.Change({
            operation: 'add',
            modification: {
              [field]: newVal,
            },
          }));
        }
        return;
      }

      // delete if value is null
      if (value === null) {
        array.push(new ldap.Change({
          operation: 'delete',
          modification: {
            [field]: oldData[field],
          },
        }));
        return;
      }

      // If old value is not equaling and ...
      if (!_.isEqual(oldData[field].toString(), newVal)) {
        if (!_.isEqual(newVal, '')) {
          // ... this value is not blank, then replace
          array.push(new ldap.Change({
            operation: 'replace',
            modification: {
              [field]: newVal,
            },
          }));
        } else {
          // ... this value is blank, then delete
          array.push(new ldap.Change({
            operation: 'delete',
            modification: {
              [field]: oldData[field],
            },
          }));
        }
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const updateDataArray = [];
        const sn = `${newData.firstNameRu || ' '} ${newData.lastNameRu || ' '}`;
        addDataToArray(updateDataArray, 'sn', sn);
        addDataToArray(updateDataArray, 'cn', sn);
        addDataToArray(updateDataArray, 'city', newData.city, '');
        addDataToArray(updateDataArray, 'lastNameEn', newData.lastNameEn);
        addDataToArray(updateDataArray, 'firstNameEn', newData.firstNameEn);
        addDataToArray(updateDataArray, 'givenName', newData.lastNameRu);
        addDataToArray(updateDataArray, 'emailPrimary', newData.emailPrimary);
        addDataToArray(updateDataArray, 'mail', newData.emailPrimary);
        addDataToArray(updateDataArray, 'uidNumber', newData.id);
        const homeDirectory = `/home/${newData.firstNameEn.toLowerCase()}.${newData.lastNameEn.toLowerCase()}`;
        addDataToArray(updateDataArray, 'homeDirectory', homeDirectory);
        addDataToArray(updateDataArray, 'telegram', newData.telegram);
        addDataToArray(updateDataArray, 'department', newData.deptNames);
        addDataToArray(updateDataArray, 'company', newData.company);
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
          addDataToArray(updateDataArray, 'active', '0');
          // const password = crypto.randomBytes(40).toString('base64').substring(0,50); // 304 bits, 50 charestres
          const password = crypto.randomBytes(50).toString('hex'); // 400 bits, 100 charestres
          addDataToArray(updateDataArray, 'userPassword', password);
        }

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
  },
};
