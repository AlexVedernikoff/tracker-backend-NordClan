const ldap = require('ldapjs');
const User = require('../../models').User;
const ldapUrl = 'ldap://auth.simbirsoft:389/dc=simbirsoft';

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

        client.search('cn=People,dc=simbirsoft', opts, function(err, search) {
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
            console.error('error: ' + (err));
            reject(err);
          });

          search.on('end', function() {
            client.unbind(function() {
              console.log('Close ldap connection.');
              resolve(promises);
            });
          });

        });
      });
    });

};
