const createError = require('http-errors');
const moment = require('moment');
const jwt = require('jwt-simple');
const User = require('./User');
const UserTokens = require('./UserTokens');
const tokenSecret = 'token_s';


exports.createJwtToken = createJwtToken;
exports.checkTokenMiddleWare = checkTokenMiddleWare;


function createJwtToken(user) {
	const payload = {
		user: user,
		iat: moment().format(),
		expires: moment().add(1, 'days').format()
	};
	return {token: jwt.encode(payload, tokenSecret), expires: payload.expires};
}



function checkTokenMiddleWare(req, res, next) {

	let token, decoded;

	if (!req.headers.authorization) {
		if (req.url.indexOf('auth/login') > -1){//potential defect /ffff/auth/loginfdfgdfd - is not validated
			console.log('no token login');
			return next();
		}
		return next(createError(401, 'Need  authorization'));
	}

	try {
		token = req.headers.authorization;
		decoded = jwt.decode(token, tokenSecret);
		req.token = token;
		req.decoded = decoded;
	} catch (err) {
		return next(createError(403, 'Can not parse access token - it is not valid'));
	}


	User.findOne({
		where: {
			login: decoded.user.login
		},
		attributes: ['id']
	})
		.then((user) => {
			if(!user) return next(createError(401, 'No such user in the system'));

			UserTokens.findOne({
				where: {
					user_id: user.dataValues.id,
					token: token
				},
				attributes: ['expires']
			})
				.then((token) => {
					if (!token) return next(createError(401, 'No such access token in the system'));
					if (moment().isAfter(token.expires)) return next(createError(401, 'Access token has expired'));
					if (req.url.indexOf('auth/login') > -1) return next(createError(422, 'Already logged in'));

					return next();
				})
				.catch((err) => {
					return next(createError(err));
				});

		})
		.catch((err) => {
			return next(createError(err));
		});


}