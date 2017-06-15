const ldap = require('ldapjs');
const os = require('os');

const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const User = require('../models/User');
const createError = require('http-errors');

const Models  = [
	Portfolio,
	Project,
	Sprint,
	Task,
	User,
];

const ldapUrl = (os.hostname().indexOf('-qa') > 0) ? 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft' : 'ldap://auth.simbirsoft:389/dc=simbirsoft';



exports.syncUsers = function(req, res, next) {


	let client = ldap.createClient({
		url: ldapUrl
	});

	let opts = {
		scope: 'sub',
		filter: '(objectClass=inetOrgPerson)'
	};

	client.bind('', '', function(err) {

		client.search('cn=People,dc=simbirsoft', opts, function(err, search) {

			search.on('searchEntry', function(entry) {
				let ldapUser = entry.object;

				if(ldapUser.uid == 'mikhail.miheev') {
					console.log(ldapUser);
				}


				User.create({
					login: ldapUser.uid,
					email: ldapUser.mail,
					lastNameEn: ldapUser.sn,
					firstNameEn: ldapUser.givenName,

				})
					.then(() => {
						res.end();
					})
					.catch((err) => {
						next(createError(err));
					});


			});

			search.on('error', function(err) {
				console.error('error: ' + JSON.stringify(err));
			});

			search.on('end', function() {
				client.unbind(function() {
					console.log('Close ldap connection.');
				});
			});
		});

	});


	res.end();

};

exports.syncForce = function(req, res, next) {
	let chain = Promise.resolve();

	Models.forEach(function(Model) {
		chain = chain
			.then(() => Model.sync({force: true}))

	});

	chain
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});

};

