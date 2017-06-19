const request = require('request');
const moment = require('moment');
const xml2js = require('xml2js').parseString;
const Department = require('../../models/Department');
const User = require('../../models/User');
// var User = require('../../server/user/class');
// var Role = require('../../server/role/class');
//var _ = require('underscore');
const ldap = require('../ldap/index2');
const departmentIDs = [
  'o2k007g0000jjksd9m30000000' // Analitycs
  ,'o2k007g0000jcktq5td0000000' // Mobile Dev
  ,'o2k187g0000l7j0u3840000000' // Design
  ,'o2k007g0000jcktnngp0000000' // C++
  ,'o2k187g0000lgkhv2ckg000000' // .Net 
  ,'o2k187g0000lgoe24igg000000' // Bitrix
  ,'o2k187g0000lgoe4rp60000000' // Python
  ,'o2k187g0000lh1fp702g000000' // QA Automation
  ,'o2k187g0000lgkho90fg000000' //  Ruby
  ,'o2k187g0000lgkhmfg6g000000' // QA o2k187g0000lgkhmfg6g000000
  ,'o2k187g0000lgoekeh9g000000' // Frontend/JS o2k187g0000lgoekeh9g000000
  ,'o2k187g0000lh58rbh10000000' // Java o2k187g0000lh58rbh10000000
  ,'o2k187g0000lgoe7gos0000000' // PHP o2k187g0000lgoe7gos0000000
];
const auth = {
  user: 'serviceman',
  pass: 'FdKg&$b*)FeA{',
  sendImmediately: true
};
const defaultRole = null;
const defaultRoleName = 'employee';
const baseUrl = 'http://ps.simbirsoft/default/rest/';
const jsonOpts = {
  object: true,
  reversible: false,
  coerce: true,
  sanitize: false,
  trim: true,
  arrayNotation: false
};
module.exports = function(callback) {
  ldap()

			.then(() => {

				return new Promise(function(resolve, reject) {

					request.get({
						url: baseUrl + 'users',
						auth
					}, function(err, response, body) {
						if (err) reject(err);

						xml2js(body, (err, result) => {
							if (err)  reject(err);

							let users = result.users.user.map((x) => {



								return {
									psId: x.$.id,
									login: x.login[0],
									firstNameRu: (x.firstNameRu[0]) ? x.firstNameRu[0] : '',
									lastNameRu: (x.lastNameRu[0]) ? x.lastNameRu[0] : '',
									firstNameEn:(x.firstNameEn && '0' in x.firstNameEn) ? x.firstNameEn[0] : '',
									lastNameEn: (x.firstNameEn && '0' in x.lastNameEn) ? x.lastNameEn[0] : '',
									photo: x.photo[0],
									emailPrimary: (x.emailPrimary && x.emailPrimary[0]) ? x.emailPrimary[0] : '',
									emailSecondary: (x.emailSecondary && x.emailSecondary[0]) ? x.emailSecondary[0] : '',
									skype: (x.skype && x.skype[0]) ? x.skype[0] : '',
									city: (x.city && x.city[0]) ? x.city[0] : '',
									phone: (x.phone && x.phone[0]) ? x.phone[0] : '',
									mobile: (x.mobile && x.mobile[0]) ? x.mobile[0] : '',
									active: (x.active && x.active[0] && x.active[0] == 'true' ) ? 1 : 0,

									deleteDate: (x.deleteDate && x.deleteDate[0]) ? moment(x.deleteDate[0], 'DD.MM.YYYY HH:mm' ).format() : null,
									birthDate: (x.birthDate && x.birthDate[0]) ? moment(x.birthDate[0], 'DD.MM.YYYY HH:mm' ).format() : null,
									createdAt: x.createDate,
								};
							});

							resolve(users);

						});


					});
				})

			})
			.then((users) => {


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
									if(user) {

										console.log(x);

										user.updateAttributes(x)
											.then(() => {
												console.log(12);
											})
											.catch((err) => {
												console.error('error: ' + (err));
											});

									}

								})
								.catch((err) => {
									console.error('error: ' + (err));
								});

						})

				});


			})
		.then(() => {

			return new Promise(function(resolve, reject) {
				request.get({
					url: baseUrl + 'groups',
					auth
				}, function(err, response, body) {
					if (err)  reject(err);

					xml2js(body, (err, result) => {
						if (err)  reject(err);

						let departments = result.groups.group.map((x) => {
							return {
								psId: x.$.id,
								name: x.$.name,
								psMembers: x.user.map((user) => {
									return user.$.id;
								})
							};
						});

						resolve(departments);

					});

				});
			})
				.then((departments) => {
					let promise =  Promise.resolve();

					departments
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
											});
										}
									})
									.then(() => {



									});

							});
						});
					return promise;

				});



    });

  /*
      new Promise(function(resolve, reject) {
        request.get({
          url: baseUrl + 'users',
          auth
        }, function(error, response, body) {
          if (error) {
            reject(error);
          } else {
            var users = _.compact(xml2js.toJson(body, jsonOpts).users.user.map((x) => {
              if (x.active) {
                var psDepartments = x.groups ? extract(x.groups.group) : [];
                return {
                  login: x.login,
                  fullName: x.firstNameRu + ' ' + x.lastNameRu,
                  firstname: x.firstNameRu,
                  lastname: x.lastNameRu,
                  photo: x.photo,
                  importStatus: true,
                  psDepartments,
                  isActive: x.active
                };
              }
            }));
            resolve(users);
          }
        });
      })
      .then((users) => {
        var promises = [];
        users
          .forEach((x) => {
            promises.push(User
              .find({uid: x.login})
              .then((user) => {
                if (!user.role || user.role == '') {
                  console.log('Role', defaultRoleName, 'was assigned to', user._model.fullName);
                  user._model.role = defaultRole._model._id;
                }
                return user.update(x);
              })
              .catch((err) => console.log(err))
            );
          });
        return Promise.all(promises);
      })
    ]);
  })
  .then((results) => {
    callback(null, results);
  })
  .catch((err) => {
    callback(err);
  });*/
};

function extract(obj, prop) {
  if (!prop) {
    return Array.isArray(obj) ? obj : [obj];
  }
  return Array.isArray(obj) ? obj.map((x) => x[prop]) : [obj[prop]];
}
