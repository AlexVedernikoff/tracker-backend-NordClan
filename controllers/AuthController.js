const createError = require('http-errors');
const ldap = require('ldapjs');
const Auth = require('../models/Auth');
const User = require('../models/User');
const UserTokens = require('../models/UserTokens');


//const ldapUrl = 'ldap://auth-test-estimate.simbirsoft:389/dc=simbirsoft';
const ldapUrl = 'ldap://auth.simbirsoft:389/dc=simbirsoft';

exports.login = function(req, res, next){

	if (!req.body.login || !req.body.password) {
		next(createError(401, 'Login and password are required'));
	}


	User.findOne({
		where: {
			login: req.body.login,
		}
	})
		.then((user) => {
			if(!user) {
				next(createError(404, 'Invalid Login or Password'));
			}

			authLdap(user, req.body.password);
		})
		.catch((err) => {
			next(createError(err));
		});


	function authLdap(user, password) {

		const client = ldap.createClient({
			url: ldapUrl
		});


		client.bind('cn=' + user.firstNameEn + ' ' + user.lastNameEn + ',cn=People,dc=simbirsoft', password, function(err) {
			if (err) {
				client.unbind();
				next(createError(err));
			} else {

				const token = Auth.createJwtToken({
					login: req.body.login,
					password: req.body.password
				});

				console.log(user.dataValues.id);

				UserTokens.create({
					userId: user.dataValues.id,
					token: token.token,
					expires: token.expires
				})
					.then(() => res.status(200).json({token: token.token, expire: token.expires, user: user.dataValues.id}))
					.catch((err) => {
						if (err) {
							console.error(err.stack);
						}
						return res.status(500).json({code: 0, type: 1, message: 'Failed to save userdata'});
					});


			}
		});
	}

};


exports.logout = function(req, res, next){

	UserTokens.destroy({
		where: {
			user_id: req.user.id,
			token: req.token
		}
	})
		.then((row) => {
			if(!row) { return next(createError(404)); }

			res.sendStatus(200);

		})
		.catch((err) => {
			next(err);
		});

};

