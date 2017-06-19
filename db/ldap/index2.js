const ldap = require('ldapjs');
const orm = require('../../orm');
const User = require('../../models/User');
const os = require('os');


const ldapUrl = 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft';

// Синхронизация пользователей
module.exports = function() {

  let promises = [];
	let client = ldap.createClient({
		url: ldapUrl
	});
	let opts = { scope: 'sub', filter: '(objectClass=inetOrgPerson)' }


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

						User.findOne({
							where: {
								login: ldapUser.uid
							}
						})
							.then(user => {
								if(user) {


									user.updateAttributes({
										emailPrimary: ldapUser.mail,
										lastNameRu: ldapUser.sn,
										firstNameRu: ldapUser.givenName,
									})
										.catch((err) => {
											console.error('error: ' + (err));
											reject(err);
										});

								} else {

									User.create({
										login: ldapUser.uid,
										emailPrimary: ldapUser.mail,
										lastNameRu: ldapUser.sn,
										firstNameRu: ldapUser.givenName,
									})
										.catch((err) => {
											console.error('error1: ' + (err));
											reject(err);
										});

								}

							})
							.catch((err) => {
								console.error('error2: ' + (err));
								reject(err);
							});


					});


					search.on('error', function(err) {
						console.error('error3: ' + (err));
						reject(err);
					});

					search.on('end', function() {
						client.unbind(function() {
							console.log('Close ldap connection.');
							resolve(promises);
						});
					});

				})
			});
		});


/*  return new Promise(function(resolve, reject) {


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
  });*/
};
