const request = require('request');
const xml2json = require('xml2json');
const moment = require('moment');
const _ = require('underscore');
const Department = require('../../../models').Department;
const User = require('../../../models').User;
const auth = {
	user: 'serviceman',
	pass: 'FdKg&$b*)FeA{',
	sendImmediately: true
};
const jsonOpts = {
	object: true,
	reversible: false,
	coerce: true,
	sanitize: false,
	trim: true,
	arrayNotation: false
};
const baseUrl = 'http://ps.simbirsoft/default/rest/';


module.exports = function() {

	return new Promise((resolve, reject) => {
		let promise = syncUsers();
		promise.then(() => {
			return syncDepartments();
		});
		promise.then(() => {
			resolve();
		});
		promise.catch((err) => {
			reject(err);
		});

	});

};


syncUsers = function() {
	return new Promise(function(resolve, reject) {

		request.get({
			url: baseUrl + 'users',
			auth
		}, function(err, response, body) {
			if (err) reject(err);

			let users = _.compact( xml2json.toJson(body, jsonOpts).users.user.map((x) => {


				return {
					psId: x.id,
					login: x.login,
					firstNameRu: x.firstNameRu,
					lastNameRu: x.lastNameRu,
					firstNameEn: x.firstNameEn,
					lastNameEn: x.lastNameEn,
					emailPrimary :x.emailPrimary,
					photo: (!_.isEmpty(x.photo)) ? x.photo: null,
					emailSecondary: (!_.isEmpty(x.emailSecondary)) ? x.emailSecondary: null,
					skype: (!_.isEmpty(x.skype)) ? x.skype: null,
					city: (!_.isEmpty(x.city)) ? x.city: null,
					phone: (!_.isEmpty(x.phone)) ? x.phone: null,
					mobile: (!_.isEmpty(x.mobile)) ? x.mobile: null,
					active: +!!x.active,

					birthDate: (!_.isEmpty(x.birthDate)) ? moment(x.birthDate, 'DD.MM.YYYY' ).format() : null,
					deleteDate: (!_.isEmpty(x.deleteDate)) ? moment(x.deleteDate, 'DD.MM.YYYY HH:mm' ).format() : null,
					createDate: (!_.isEmpty(x.createDate)) ? moment(x.createDate, 'DD.MM.YYYY HH:mm' ).format() : null,
				};


			}));

			resolve(users);

		});
	})
		.then((users) => {

			return new Promise(function(resolve, reject) {
				let chain = Promise.resolve();

				users.forEach(function(x) {

					chain = chain
						.then(() => {
							return User.findOne({
								where: {
									login: x.login
								}
							})
								.then(user => {
									if(user) user.updateAttributes(x, {
										validate: false,
									}).catch((err) => {
										console.error(err);
										console.error('error: ' + (err));
									});
								})
								.catch((err) => {
									console.error('error: ' + (err));
								});
						})
				});
				chain
					.then(() => {
					console.log('syncUsers finished');
						resolve();
					})
					.catch((err) => {
						console.error('error: ' + (err));
						reject(err);
					});
			});



		})
};

syncDepartments = function() {
	return new Promise(function(resolve, reject) {
		request.get({
			url: baseUrl + 'groups',
			auth
		}, function(err, response, body) {
			if (err)  reject(err);

			let departments = _.compact( xml2json.toJson(body, jsonOpts).groups.group.map((x) => {
				return {
					psId: x.id,
					name: x.name,
					psMembers: extract(x.user, 'id')
				};
			}));


			resolve(departments);
		});
	})
		.then((Departments) => {
			let promise =  Promise.resolve();
			Departments
				.forEach((x) => {
					promise.then(() => {
						return Department.findOne({
							where: {
								psId: x.psId
							}
						})
							.then(department => {
								if(department) {
									return department.updateAttributes({
										name: x.name,
									});

								} else {
									return Department.create({
										name: x.name,
										psId: x.psId
									}, {
										validate: false,
										raw: true,
									});
								}
							})
							.then((department) => {
								x.psMembers.forEach((memberId) => {

									User.findOne({where: { psId: memberId}})
										.then((user) => {
											if(user) {
												user.addDepartment(department);
											}
										});
								});



							})
					});
				});

			promise.then(() => {
				console.log('syncDepartments finished');
			});
			return promise;

		})
};

function extract(obj, prop) {
	if (!prop) {
		return Array.isArray(obj) ? obj : [obj];
	}
	return Array.isArray(obj) ? obj.map((x) => x[prop]) : [obj[prop]];
}
