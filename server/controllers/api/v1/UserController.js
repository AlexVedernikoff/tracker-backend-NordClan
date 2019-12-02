const createError = require('http-errors');
const models = require('../../../models');
const LDAP = require('../../../services/ldap/index');

const bcrypt = require('bcrypt-nodejs');
const { User, Department } = models;
const moment = require('moment');
const crypto = require('crypto');
const emailService = require('../../../services/email');
const layoutAgnostic = require('../../../services/layoutAgnostic');
const { bcryptPromise } = require('../../../components/utils');
const { email: { templateExternalUrl } } = require('../../../configs');

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
        id: req.params.id
      },
      attributes: models.User.defaultSelect,
      include: [
        {
          model: models.Department,
          as: 'department',
          required: false,
          attributes: ['name', 'id'],
          through: {
            model: models.UserDepartments,
            attributes: []
          }
        }
      ]
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }
    user.dataValues.departmentList = user.dataValues.department;

    if (user.dataValues.department[0]) {
      user.dataValues.department = user.dataValues.department[0].name;
    } else {
      user.dataValues.department = '';
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
      const userName = req.query.userName;
      const userNameArray = userName.trim().split(/\s+/);
      const iLikeFirstName = layoutAgnostic(userNameArray[0] ? userNameArray[0] : '');
      const iLikeLastName = layoutAgnostic(userNameArray[1] ? userNameArray[1] : '');


      const $or = [
        {
          firstNameEn: {
            $iLike: iLikeFirstName
          },
          lastNameEn: {
            $iLike: iLikeLastName
          }
        },
        {
          firstNameRu: {
            $iLike: iLikeFirstName
          },
          lastNameRu: {
            $iLike: iLikeLastName
          }
        },
        {
          firstNameEn: {
            $iLike: iLikeLastName
          },
          lastNameEn: {
            $iLike: iLikeFirstName
          }
        },
        {
          firstNameRu: {
            $iLike: iLikeLastName
          },
          lastNameRu: {
            $iLike: iLikeFirstName
          }
        }
      ];

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

exports.getAllUsers = async function (req, res, next) {
  try {
    const usersList = await models.User.findAll({
      attributes: [
        'id',
        'firstNameRu',
        'lastNameRu',
        'firstNameEn',
        'lastNameEn',
        'photo',
        'skype',
        'emailPrimary',
        'mobile'
      ]
    });

    res.json(usersList);
  } catch (err) {
    next(err);
  }
};

exports.devOpsUsers = async function (req, res, next) {
  try {
    const devOpsList = await models.User.findAll({
      where: {
        globalRole: {
          $eq: 'DEV_OPS'
        }
      },
      attributes: [
        'id',
        'firstNameRu',
        'lastNameRu',
        'firstNameEn',
        'lastNameEn',
        'photo',
        'skype',
        'emailPrimary',
        'mobile'
      ]
    });
    res.json(devOpsList);
  } catch (err) {
    next(err);
  }
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
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const model = await User.findByPrimary(id, { transaction, lock: 'UPDATE' });
    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    const updatedModel = await model.updateAttributes({ globalRole }, { transaction });
    await transaction.commit();
    res.json({
      id: updatedModel.id,
      globalRole: updatedModel.globalRole,
      firstNameRu: updatedModel.firstNameRu,
      lastNameRu: updatedModel.lastNameRu,
      firstNameEn: updatedModel.firstNameEn,
      lastNameEn: updatedModel.lastNameEn
    });


  } catch (err) {
    if (err) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.updateCurrentUserProfile = async function (req, res, next) {
  const { id } = req.body;
  const user = req.body;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const model = await User.findByPrimary(id, { transaction, lock: 'UPDATE' });
    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    // TODO: Сделать обновление без запроса всего справочника
    const departList = await Department.findAll();

    const newDepartList = departList.filter(el => {
      for (const i in user.departmentList) {
        if (el.id === user.departmentList[i]) {
          return el;
        }
      }
    });

    await model.setDepartment(newDepartList, { transaction }).catch(console.log);

    const updatedModel = await model.updateAttributes(user, { transaction });
    if (!updatedModel) {
      await transaction.rollback();
      return next(createError(404));
    }
    await transaction.commit();
    res.sendStatus(200);

  } catch (err) {
    if (err) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.updateUserProfile = async function (req, res, next) {
  const { id } = req.body;
  const user = req.body;

  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const model = await User.findByPrimary(id, { transaction, lock: 'UPDATE' });
    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    // TODO: Сделать обновление без запроса всего справочника
    const departList = await Department.findAll();

    const newDepartList = departList.filter(el => {
      for (const i in user.departmentList) {
        if (el.id === user.departmentList[i]) {
          return el;
        }
      }
    });

    await model.setDepartment(newDepartList, { transaction }).catch(console.log);

    const updatedModel = await model.updateAttributes(user, { transaction });
    if (!updatedModel) {
      await transaction.rollback();
      return next(createError(404));
    }
    await transaction.commit();
    res.sendStatus(200);

  } catch (err) {
    if (err) {
      await transaction.rollback();
      return next(createError(500));
    }
    next(err);
  }
};

exports.createUser = async function (req, res, next) {
  let transaction;
  const uid = `${req.body.firstNameEn.toLowerCase()}.${req.body.lastNameEn.toLowerCase()}`;
  const validationResult = await req.getValidationResult();

  if (!validationResult.isEmpty()) {
    return next(createError(400, validationResult.array()));
  }


  try {
    const userModel = await models.User.findOne({
      where: {
        login: uid
      },
      attributes: models.User.defaultSelect
    });

    if (userModel !== null) {
      return next(createError(400, 'user is already exist'));
    }

    transaction = await models.sequelize.transaction();
    const params = {
      active: 1,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      login: uid,
      ldapLogin: uid,
      fullNameRu: [req.body.firstNameRu, req.body.lastNameRu].filter(i => i).join(' '),
      fullNameEn: [req.body.firstNameEn, req.body.lastNameEn].filter(i => i).join(' '),
      ...req.body
    };
    for (const name in params) {
      if (params[name] === '') {
        delete params[name];
      }
    }

    User.create(params)
      .then(async (model) => {
        // TODO: Сделать обновление без запроса всего справочника
        params.uidNumber = +model.id;
        req.body.uidNumber = +model.id;

        const departList = await Department.findAll();
        const newDepartList = departList.filter(el => {
          for (const i in req.body.departmentList) {
            if (el.id === req.body.departmentList[i]) {
              return el;
            }
          }
        });

        await model.setDepartment(newDepartList, { transaction })
          .catch(err => {
            transaction.rollback();
            return next(err);
          });

        const userLdap = await LDAP.create(req.body);
        if (!userLdap) {
          transaction.rollback();
          return next(createError(500));
        }

        await transaction.commit();
        res.sendStatus(200);
      })
      .catch(err => {
        console.log('catch userController', err);

        if (err.SequelizeBaseError) {
          transaction.rollback();
          next(err);
        }
        transaction.rollback();
        next(createError(500));
      });

  } catch (err) {
    console.log('-----> create user ERR', err);
    if (err) {
      await transaction.rollback();
      return next(createError(500));
    }
    next(err);
  }


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
  const expiredDate = new Date(moment(req.body.expiredDate).millisecond(999).second(59).minute(59).hour(23));
  const params = {
    active: 1,
    isActive: 0,
    globalRole: 'EXTERNAL_USER',
    ldapLogin: req.body.login,
    createdAt: new Date(),
    updatedAt: new Date(),
    setPasswordToken,
    setPasswordExpired,
    ...req.body,
    expiredDate
  };

  User.create(params)
    .then(model => {
      const template = emailService.template('activateExternalUser', {
        token: setPasswordToken
      }, templateExternalUrl);
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
    }, templateExternalUrl);
    emailService.send({
      receiver: req.body.login,
      subject: template.subject,
      html: template.body
    });
    res.json(updatedModel);
  } catch (err) {
    next(
      createError(500, `Error when refresh token. ${err.message} `)
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

  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const model = await User.findByPrimary(req.params.id, {
      transaction,
      lock: 'UPDATE'
    });

    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    const updatedModel = await model.updateAttributes(req.body, { transaction });
    await transaction.commit();
    res.json(updatedModel);

  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
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

exports.updateTestUser = async function (req, res, next) {
  try {
    req.sanitize('id').trim();
    req
      .checkParams('id', 'id must be int')
      .notEmpty()
      .isInt();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }

    const model = await models.User.findOne({
      where: {
        id: req.params.id,
        isTest: true
      },
      attributes: models.User.defaultSelect
    });

    if (!model) {
      return next(createError(404, 'User not found'));
    }

    if (req.body.password) {
      req.body.password = await bcryptPromise.hash(req.body.password);
    }


    const updatedModel = await model.updateAttributes(req.body);
    res.json(updatedModel);

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
            isActive: 1,
            $or
          },
          limit: req.query.pageSize ? +req.query.pageSize : 10,
          attributes: ['id', 'active', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'fullNameRu', 'fullNameEn']
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
