var ldap = require('ldapjs');
//var User = require('../../server/user/class');
var os = require('os');

///console.log(os.hostname());

var ldapUrl = (os.hostname().indexOf('-qa') > 0) ? 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft' : 'ldap://auth.simbirsoft:389/dc=simbirsoft';

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

			// Получаем список всех пользователей из ldap
			client.search('cn=People,dc=simbirsoft', opts, function(err, search) {
				if (err) {
					reject(err);
				}

				search.on('searchEntry', function(entry) {
					var ldapUser = entry.object;
					var user = null;
					User.find({uid: ldapUser.uid})
						.catch((err) => {
							if (!err) {
								user = new User({
									cn: ldapUser.cn,
									uid: ldapUser.uid,
									email: ldapUser.mail,
									fullName: ldapUser.givenName + ' ' + ldapUser.sn,
									firstname: ldapUser.givenName,
									lastname: ldapUser.sn,
									isActive: true
								});
							} else {
								user = new User({
									cn: ldapUser.cn,
									uid: ldapUser.uid,
									email: ldapUser.mail,
									fullName: ldapUser.givenName + ' ' + ldapUser.sn,
									firstname: ldapUser.givenName,
									lastname: ldapUser.sn,
									isActive: false
								});
							}
							return user;
						})
						.then((user) => {
							promises.push(user.save());
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
