const ldap = require('ldapjs');
const orm = require('../../orm');
//var User = require('../../server/user/class');
const User = require('../../models/User');
const os = require('os');

//const ldapUrl = (os.hostname().indexOf('-qa') > 0) ? 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft' : 'ldap://auth.simbirsoft:389/dc=simbirsoft';
const ldapUrl = 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft';

// Синхронизация пользователей
module.exports = function() {
  var promises = [];
  return new Promise(function(resolve, reject) {
    var client = ldap.createClient({
      url: ldapUrl
    });

    var opts = {
      scope: 'sub',
      filter: '(objectClass=inetOrgPerson)'
    };



    client.bind('', '', function(err) {
      if (err) {
        reject(err);
      }

      client.search('cn=People,dc=simbirsoft', opts, function(err, search) {
        if (err) {
          reject(err);
        }

        search.on('searchEntry', function(entry) {

					var ldapUser = entry.object;
          console.log(ldapUser);

					let user = User.findOne({
						where: {
						  login: ldapUser.uid
            }
					})
						.then(user => {
              if(user) {

								user.updateAttributes({
									email: ldapUser.mail,
									lastNameEn: ldapUser.sn,
									firstNameEn: ldapUser.givenName,
								})
									.catch((err) => {
										console.error('error: ' + JSON.stringify(err));
										reject(err);
									});

              } else {

								User.create({
									login: ldapUser.uid,
									email: ldapUser.mail,
									lastNameEn: ldapUser.sn,
									firstNameEn: ldapUser.givenName,
								})
									.catch((err) => {
										console.error('error: ' + JSON.stringify(err));
										reject(err);
									});

              }

						})
						.catch((err) => {
							console.error('error: ' + JSON.stringify(err));
							reject(err);
						});


        });

        search.on('error', function(err) {
          console.error('error: ' + JSON.stringify(err));
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
