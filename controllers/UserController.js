const createError = require('http-errors');
const models = require('../models');

exports.me = function(req, res, next){
	new UserController(req, res, next, req.user.id)
		.sendUserInfo();
};

exports.raed = function(req, res, next){
	req.checkParams('id', 'id must be integer' ).isInt();
	req
		.getValidationResult()
		.then((result) => {

			if (!result.isEmpty()) {
				let err = new Error();
				err.statusCode = 400;
				err.name = 'ValidationError';
				err.message = { errors: result.array() };
				return next(err);
			}

			new UserController(req, res, next, req.params.id)
				.sendUserInfo();
		});
};



class UserController {

	constructor(req, res, next, userId) {
		this.req = req;
		this.res = res;
		this.next = next;
		this.userId = userId;
	}

	sendUserInfo() {
		return models.User
			.findOne({
				where: {
					id: this.userId,
					active: 1,
				},
				attributes: ['id', 'login', 'ldapLogin', 'lastNameEn', 'firstNameEn', 'lastNameRu', 'firstNameRu', 'photo', 'emailPrimary', 'emailSecondary', 'phone', 'mobile', 'skype', 'city', 'birthDate' ],
				include: [
					{
						model: models.Department,
						as: 'department',
						required: false,
						attributes: ['name'],
						through: {
							model: models.UserDepartments,
							attributes: []
						},
					}

				]
			})
			.then((user) => {
				if(!user) {
					return this.next(createError(404, 'User not found'));
				}

				if(user.dataValues.department[0]) {
					user.dataValues.department = user.dataValues.department[0].name;
				}

				//if(user.dataValues.department) user.dataValues.department = Object.keys(user.dataValues.department).map((k) => user.dataValues.department[k].name); // Преобразую отделы из объекта в массив
				this.res.end(JSON.stringify(user.dataValues));

			})
			.catch((err) => {
				this.next(createError(err));
			});
	};

}
