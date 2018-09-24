const createError = require('http-errors');
const models = require('../../../models');
const bcrypt = require('bcrypt-nodejs');
const { User } = models;
const moment = require('moment');
const crypto = require('crypto');
const emailService = require('../../../services/email');
const layoutAgnostic = require('../../../services/layoutAgnostic');

exports.me = function (req, res, next) {
  try {
    res.json(req.user);
  } catch (e) {
    return next(createError(e));
  }
};

exports.read = async function (req, res, next) {
  try {
    req.sanitize('id').trim();
    req
      .checkParams('id', 'id must be int')
      .notEmpty()
      .isInt();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {return next(createError(400, validationResult));}

    const user = await models.User.findOne({
      where: {
        id: req.params.id,
        active: 1
      },
      attributes: models.User.defaultSelect,
      include: [
        {
          model: models.Department,
          as: 'department',
          required: false,
          attributes: ['name'],
          through: {
            model: models.UserDepartments,
            attributes: []
          }
        }
      ]
    });

    if (!user) return next(createError(404, 'User not found'));

    if (user.dataValues.department[0]) {
      user.dataValues.department = user.dataValues.department[0].name;
    }

    res.json(user);
  } catch (e) {
    return next(createError(e));
  }
};

exports.autocomplete = function (req, res, next) {
  req.sanitize('userName').trim();
  req.checkQuery('userName', 'userName must be not empty').notEmpty();
  req
    .getValidationResult()
    .then(validationResult => {
      if (!validationResult.isEmpty()) {return next(createError(400, validationResult));}

      const result = [];
      const userName = req.query.userName.trim();
      let $iLike = layoutAgnostic(userName);
      const reverseUserName = userName.split(' ').reverse().join(' '); //ищем Павла Ищейкина и Ищейкина Павла
      let $or = [
        {
          fullNameRu: {
            $iLike
          }
        },
        {
          fullNameEn: {
            $iLike
          }
        }
      ];
      if (reverseUserName !== userName) {//Введено и имя и фамилия или их части
        $iLike = layoutAgnostic(reverseUserName);
        $or = $or.concat([
          {
            fullNameRu: {
              $iLike
            }
          },
          {
            fullNameEn: {
              $iLike
            }
          }
        ]);
      }

      return models.User
        .findAll({
          where: {
            active: 1,
            $or
          },
          limit: req.query.pageSize ? +req.query.pageSize : 10,
          attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn']
        })
        .then((users) => {
          users.forEach((user) => {
            result.push({fullNameRu: user.fullNameRu, fullNameEn: user.fullNameEn, id: user.id});
          });
          res.end(JSON.stringify(result));
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => next(createError(err)));
};

exports.getUsersRoles = async function (req, res, next) {
  try {
    const users = await models.User.findAll({
      where: {
        active: 1,
        globalRole: { $not: 'EXTERNAL_USER' }
      },
      order: [['last_name_ru']],
      attributes: [
        'id',
        'firstNameRu',
        'lastNameRu',
        'firstNameEn',
        'lastNameEn',
        'globalRole'
      ]
    });

    const usersWithFilteredData = users.map(user => {
      const {
        id,
        firstNameRu,
        lastNameRu,
        globalRole,
        firstNameEn,
        lastNameEn
      } = user;
      return {
        id,
        firstNameRu,
        lastNameRu,
        firstNameEn,
        lastNameEn,
        globalRole
      };
    });

    res.json(usersWithFilteredData);
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async function (req, res, next) {
  const { id, globalRole } = req.body;

  return models.sequelize
    .transaction(function (t) {
      return User.findByPrimary(id, { transaction: t, lock: 'UPDATE' }).then(
        model => {
          if (!model) {
            return next(createError(404));
          }

          return model
            .updateAttributes({ globalRole }, { transaction: t })
            .then(updatedModel => {
              const updatedUser = {
                id: updatedModel.id,
                globalRole: updatedModel.globalRole,
                firstNameRu: updatedModel.firstNameRu,
                lastNameRu: updatedModel.lastNameRu,
                firstNameEn: updatedModel.firstNameEn,
                lastNameEn: updatedModel.lastNameEn
              };
              res.json(updatedUser);
            });
        }
      );
    })
    .catch(err => {
      next(err);
    });
};

exports.createExternal = async function (req, res, next) {
  req.checkBody('login', 'login must be email').isEmail();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  const buf = crypto.randomBytes(20);
  const setPasswordToken = buf.toString('hex');
  const setPasswordExpired = new Date(moment().add(1, 'days'));
  const params = {
    active: 1,
    isActive: 0,
    globalRole: 'EXTERNAL_USER',
    ldapLogin: req.body.login,
    createdAt: new Date(),
    updatedAt: new Date(),
    setPasswordToken,
    setPasswordExpired,
    ...req.body
  };

  User.create(params)
    .then(model => {
      const template = emailService.template('activateExternalUser', {
        token: setPasswordToken
      });
      emailService.send({
        receiver: req.body.login,
        subject: template.subject,
        html: template.body
      });
      res.json(model);
    })
    .catch(err => {
      next(err);
    });
};

exports.refreshTokenExternal = async function (req, res, next) {
  try {
    req.checkBody('login', 'login must be email').isEmail();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }
    const buf = crypto.randomBytes(20);
    const setPasswordToken = buf.toString('hex');
    const setPasswordExpired = new Date(moment().add(1, 'days'));
    const params = {
      active: 1,
      isActive: 0,
      updatedAt: new Date(),
      setPasswordExpired,
      password: null,
      ...req.body,
      setPasswordToken
    };
    const updatedModel = await User.update(params, {
      where: { id: req.params.id }
    });
    const template = emailService.template('activateExternalUser', {
      token: setPasswordToken
    });
    emailService.send({
      receiver: req.body.login,
      subject: template.subject,
      html: template.body
    });
    res.json(updatedModel);
  } catch (err) {
    next(
      createError(500, 'Error when refresh token')
    );
  }

};

exports.updateExternal = async function (req, res, next) {
  if (req.body.login) {
    req.checkBody('login', 'login must be email').isEmail();
  }

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult));
  }

  return models.sequelize
    .transaction(function (t) {
      return User.findByPrimary(req.params.id, {
        transaction: t,
        lock: 'UPDATE'
      }).then(model => {
        if (!model) {
          return next(createError(404));
        }

        return model
          .updateAttributes(req.body, { transaction: t })
          .then(updatedModel => {
            res.json(updatedModel);
          });
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.setPassword = async function (req, res, next) {
  try {
    req
      .checkBody('password', 'password must be more then 8 chars')
      .isLength({ min: 8 });

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {return next(createError(400, validationResult));}

    const user = await models.User.findOne({
      where: {
        setPasswordToken: req.params.token,
        setPasswordExpired: { $gt: Date.now() },
        globalRole: 'EXTERNAL_USER'
      },
      attributes: models.User.defaultSelect
    });

    if (!user) {
      return next(
        createError(404, 'Password set token is invalid or has expired')
      );
    }

    const params = {
      isActive: 1,
      password: bcrypt.hashSync(req.body.password),
      setPasswordToken: null,
      setPasswordExpires: null
    };

    user.updateAttributes(params).then(updatedModel => res.json(updatedModel));
  } catch (e) {
    return next(createError(e));
  }
};

exports.getExternalUsers = async function (req, res, next) {
  try {
    const users = await models.User.findAll({
      where: {
        globalRole: 'EXTERNAL_USER',
        active: 1
      },
      order: [['first_name_ru']],
      attributes: [
        'id',
        'firstNameRu',
        'globalRole',
        'expiredDate',
        'active',
        'login',
        'isActive',
        'description'
      ]
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.autocompleteExternal = function (req, res, next) {
  req.sanitize('userName').trim();
  req.checkQuery('userName', 'userName must be not empty').notEmpty();
  req
    .getValidationResult()
    .then(validationResult => {
      if (!validationResult.isEmpty()) {return next(createError(400, validationResult));}

      const result = [];
      const userName = req.query.userName.trim();
      let $iLike = layoutAgnostic(userName);
      const reverseUserName = userName.split(' ').reverse().join(' '); //ищем Павла Ищейкина и Ищейкина Павла (хоть и пишем только в firstNameRu)
      let $or = [
        {
          firstNameRu: {
            $iLike
          }
        }
      ];
      if (reverseUserName !== userName) {//Введено и имя и фамилия или их части
        $iLike = layoutAgnostic(reverseUserName);
        $or = $or.concat([
          {
            firstNameRu: {
              $iLike
            }
          }
        ]);
      }
      return models.User
        .findAll({
          where: {
            globalRole: 'EXTERNAL_USER',
            active: 1,
            $or
          },
          limit: req.query.pageSize ? +req.query.pageSize : 10,
          attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'fullNameRu', 'fullNameEn']
        })
        .then((users) => {
          users.forEach((user) => {
            result.push({fullNameRu: user.fullNameRu, fullNameEn: user.fullNameEn, firstNameEn: user.firstNameEn, firstNameRu: user.firstNameRu, id: user.id});
          });
          res.end(JSON.stringify(result));
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => next(createError(err)));
};
