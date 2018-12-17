const request = require('request');
const xml2json = require('xml2json');
const moment = require('moment');
const _ = require('underscore');
const Department = require('../../server/models').Department;
const User = require('../../server/models').User;
const config = require('../../server/configs');
const gm = require('gm');

const baseUrl = 'http://ps.simbirsoft/default/rest/';
const auth = {
  user: config.ps.username,
  pass: config.ps.password,
  sendImmediately: true
};
const departmentIDs = [
  'o2k007g0000jjksd9m30000000', // Analitycs
  'o2k007g0000jcktq5td0000000', // Mobile Dev
  'o2k187g0000l7j0u3840000000', // Design
  'o2k007g0000jcktnngp0000000', // C++
  'o2k187g0000lgkhv2ckg000000', // .Net
  'o2k187g0000lgoe24igg000000', // Bitrix
  'o2k187g0000lgoe4rp60000000', // Python
  'o2k187g0000lh1fp702g000000', // QA Automation
  'o2k187g0000lgkho90fg000000', // Ruby
  'o2k187g0000lgkhmfg6g000000', // QA
  'o2k187g0000lgoekeh9g000000', // Frontend/JS
  'o2k187g0000lh58rbh10000000', // Java
  'o2k187g0000lgoe7gos0000000' // PHP
];
const jsonOpts = {
  object: true,
  reversible: false,
  coerce: true,
  sanitize: false,
  trim: true,
  arrayNotation: false
};

const unnecessaryPsIds = ['fs002080000ihsinfd90000000'];

module.exports = function () {
  return syncUsers()
    .then(() => {
      return syncDepartments();
    })
    .catch(err => {
      console.error(err);
    });
};

function syncUsers () {
  return new Promise(function (resolve, reject) {
    request.get(
      {
        url: baseUrl + 'users',
        auth
      },
      function (err, response, body) {
        if (err) reject(err);

        const users = _.compact(
          xml2json.toJson(body, jsonOpts).users.user.map(x => {
            return {
              psId: x.id,
              login: x.login,
              firstNameRu: x.firstNameRu,
              lastNameRu: x.lastNameRu,
              fullNameRu: x.firstNameRu + ' ' + x.lastNameRu,
              firstNameEn: x.firstNameEn,
              lastNameEn: x.lastNameEn,
              emailPrimary: x.emailPrimary,
              photo: !_.isEmpty(x.photo) ? x.photo : null,
              emailSecondary: !_.isEmpty(x.emailSecondary)
                ? x.emailSecondary
                : null,
              skype: !_.isEmpty(x.skype) ? x.skype : null,
              city: !_.isEmpty(x.city) ? x.city : null,
              phone: !_.isEmpty(x.phone) ? x.phone : null,
              mobile: x.mobile,
              active: +!!x.active,

              birthDate: !_.isEmpty(x.birthDate)
                ? moment(x.birthDate, 'DD.MM.YYYY').format()
                : null,
              createdAt: !_.isEmpty(x.createDate)
                ? moment(x.createDate, 'DD.MM.YYYY HH:mm').format()
                : null,
              deletedAt: !_.isEmpty(x.deleteDate)
                ? moment(x.deleteDate, 'DD.MM.YYYY HH:mm').format()
                : null
            };
          })
        );

        resolve(users);
      }
    );
  }).then(users => {
    return new Promise(function (resolve, reject) {
      let chain = Promise.resolve();

      users.forEach(function (x) {
        if (unnecessaryPsIds.indexOf(x.psId) !== -1) {
          return;
        }

        chain = chain.then(() => {
          return User.findOne({
            where: {
              login: x.login
            }
          })
            .then(user => {
              if (user) {
                return new Promise(function (rslv, rjct) {
                  // Обрабатываю фотографии
                  if (!user.photo && x.photo) {
                    gm(request(x.photo)).size({ bufferStream: true }, function (
                      err,
                      size
                    ) {
                      if (err) rjct(err);

                      if (!err && size.width) {
                        if (size.width >= size.height) {
                          this.resize(null, 200);
                        } else if (size.width < size.height) {
                          this.resize(200, null);
                        }
                      }

                      const photoPath
                        = '/uploads/usersPhotos/' + user.id + '.jpg';
                      this.write('./public' + photoPath, function (e) {
                        if (e) rjct(e);
                        rslv(photoPath);
                      });
                    });
                  } else {
                    rslv();
                  }
                })
                  .then(photoPath => {
                    if (photoPath) {
                      x.photo = photoPath;
                    } else {
                      delete x.photo;
                    }
                  })
                  .catch(err => {
                    if (err) {
                      console.error(err);
                    }
                    delete x.photo;
                  })
                  .then(() => {
                    // Обновляю пользователя
                    user.updateAttributes(x, {}).catch(err => {
                      console.error(err);
                      console.error('error: ' + err);
                    });
                  });
              }
            })
            .catch(err => {
              console.error('error: ' + err);
            });
        });
      });
      chain
        .then(() => {
          console.log('syncUsers finished');
          resolve();
        })
        .catch(err => {
          console.error('error: ' + err);
          reject(err);
        });
    });
  });
}

function syncDepartments () {
  return new Promise(function (resolve, reject) {
    request.get(
      {
        url: baseUrl + 'groups',
        auth
      },
      function (err, response, body) {
        if (err) reject(err);

        const departments = _.compact(
          xml2json.toJson(body, jsonOpts).groups.group.map(x => {
            return {
              psId: x.id,
              name: x.name,
              psMembers: extract(x.user, 'id')
            };
          })
        );

        resolve(departments);
      }
    );
  }).then(Departments => {
    const promise = Promise.resolve();
    const allowedIds = departmentIDs.join(' ');
    Departments.forEach(x => {
      promise.then(() => {
        if (allowedIds.indexOf(x.psId) >= 0) {
          return Department.findOne({
            where: {
              psId: x.psId
            }
          })
            .then(department => {
              if (department) {
                return department.updateAttributes({
                  name: x.name
                });
              } else {
                return Department.create(
                  {
                    name: x.name,
                    psId: x.psId
                  },
                  {
                    validate: false,
                    raw: true
                  }
                );
              }
            })
            .then(department => {
              x.psMembers.forEach(memberId => {
                User.findOne({ where: { psId: memberId } }).then(user => {
                  if (user) {
                    user.addDepartment(department);
                  }
                });
              });
            });
        }
      });
    });

    promise.then(() => {
      console.log('syncDepartments finished');
    });
    return promise;
  });
}

function extract (obj, prop) {
  if (!prop) {
    return Array.isArray(obj) ? obj : [obj];
  }
  return Array.isArray(obj) ? obj.map(x => x[prop]) : [obj[prop]];
}
