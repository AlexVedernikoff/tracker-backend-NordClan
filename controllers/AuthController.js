const createError = require('http-errors');
const moment = require('moment');
const ldap = require('ldapjs');
const Auth = require('../components/Auth');
const User = require('../models').User;
const Token = require('../models').Token;

const ldapUrl = 'ldap://auth.simbirsoft:389/dc=simbirsoft';

exports.login = function(req, res, next){

	if (!req.body.login || !req.body.password) {
		next(createError(401, 'Login and password are required'));
	}


	User.findOne({
		where: {
			login: req.body.login,
		},
		attributes: ['id', 'login', 'ldapLogin', 'lastNameEn', 'firstNameEn', 'lastNameRu', 'firstNameRu', 'photo', 'emailPrimary', 'emailSecondary', 'phone', 'mobile', 'skype', 'city', 'birthDate' ]
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

		client.bind('cn=' + user.ldapLogin + ',cn=People,dc=simbirsoft', password, function(err) {
			if (err) {
				client.unbind();
				next(createError(err));
			} else {

				const token = Auth.createJwtToken({
					login: req.body.login,
					password: req.body.password
				});

				Token
					.create({
						userId: user.dataValues.id,
						token: token.token,
						expires: token.expires.format()
					})
					.then(() => {
						res.cookie('authorization', 'Basic ' + token.token, {
							maxAge: 604800000,
							domain: extractHostname(req.headers.origin),
							httpOnly: true
						});
						user.dataValues.birthDate = moment(user.dataValues.birthDate).format('YYYY-DD-MM');
						delete user.dataValues.ldapLogin;

						res.status(200).json({
							token: token.token,
							expire: token.expires,
							user: user.dataValues
						})
					})
					.catch((err) => next(createError(err)));

			}
		});
	}

};


exports.logout = function(req, res, next){

	Token.destroy({
		where: {
			user_id: req.user.id,
			token: req.token
		}
	})
		.then((row) => {
			if(!row) return next(createError(404));


			res.cookie('authorization', 'Basic ' + req.token, {
				maxAge: -604800000,
				domain: extractHostname(req.headers.origin)
			});

			res.sendStatus(200);

		})
		.catch((err) => {
			next(err);
		});

};


exports.refresh = function(req, res, next){
	
	Token.destroy({
		where: {
			user_id: req.user.id,
			token: req.token
		}
	})
		.then((row) => {
			if(!row) { return next(createError(404)); }

			const token = Auth.createJwtToken(req.decoded.user);

			Token.create({
				userId: req.user.id,
				token: token.token,
				expires: token.expires
			})
				.then(() => res.status(200).json({token: token.token, expire: token.expires, user: req.user.id}))
				.catch((err) => {
					if (err) {
						console.error(err.stack);
					}
					return next(createError(err));
				});



		})
		.catch((err) => {
			next(err);
		});


};



function extractHostname(url) {
	var hostname;
	//find & remove protocol (http, ftp, etc.) and get hostname

	if (url.indexOf("://") > -1) {
		hostname = url.split('/')[2];
	}
	else {
		hostname = url.split('/')[0];
	}

	//find & remove port number
	hostname = hostname.split(':')[0];
	//find & remove "?"
	hostname = hostname.split('?')[0];

	return hostname;
}