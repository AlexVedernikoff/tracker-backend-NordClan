const ldap = require('ldapjs');
const moment = require('moment');
const User = require('../../server/models').User;
const ldapUrl = 'ldap://ldap.nordclan:389/dc=nordclan';

// Синхронизация пользователей
module.exports = function() {

  let promises = [];
  let client = ldap.createClient({
    url: ldapUrl
  });
  let opts = { scope: 'sub', filter: '(objectClass=inetOrgPerson)' };


  return new Promise(function(resolve, reject) {
    client.bind('', '', function(err) {
      if (err)  reject(err);
      resolve();
    });
  })
    .then(()=>{
      return new Promise(function(resolve, reject) {

        client.search('dc=nordclan', opts, function(err, search) {
          if (err) reject();

          search.on('searchEntry', function(entry) {
            let ldapUser = entry.object;


            if(!ldapUser.cn ||!ldapUser.uid || !ldapUser.mail || !ldapUser.sn || !ldapUser.givenName) {
              return ;
            }

            User
              .findOne({
                where: {
                  login: ldapUser.uid
                }
              })
              .then(user => {
                if(user) {
                  return user.updateAttributes({
                    ldapLogin: ldapUser.cn,
                    emailPrimary: ldapUser.mail,
                    lastNameRu: ldapUser.sn,
                    firstNameRu: ldapUser.givenName,
                  }, {
                    validate: false,
                    raw: true
                  });

                } else {
                  return User.create({
                    ldapLogin: ldapUser.cn,
                    login: ldapUser.uid,
                    emailPrimary: ldapUser.mail,
                    lastNameRu: ldapUser.sn,
                    firstNameRu: ldapUser.givenName,
                    createdAt: moment().toISOString(),
                    updatedAt: moment().toISOString(),
                  }, {
                    validate: false,
                    raw: true
                  });

                }
              })
              .catch((err) => {
                console.error(err);
              });

          });


          search.on('error', function(err) {
            reject(err);
          });

          search.on('end', function() {
            client.unbind(function() {
              resolve(promises);
            });
          });

        });
      });
    });

};
