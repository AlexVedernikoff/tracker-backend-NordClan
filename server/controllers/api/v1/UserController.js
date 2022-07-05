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
const {
  email: { templateExternalUrl },
} = require('../../../configs');
const ssha = require('ssha');

const userDepartmentInclude = {
  model: models.Department,
  as: 'department',
  required: false,
  attributes: ['name', 'id'],
  through: {
    model: models.UserDepartments,
    attributes: [],
  },
};

const getWhereStatement = query => {
  const res = {};

  if (query.first_name && query.last_name){
    res.$or = {
      $and: {
        firstNameEn: { $iLike: `%${query.first_name}%` },
        lastNameEn: { $iLike: `%${query.last_name}%` },
      },
      $or: {
        $and: {
          firstNameRu: { $iLike: `%${query.first_name}%` },
          lastNameRu: { $iLike: `%${query.first_name}%` },
        },
      },
    };
  } else {
    if (query.first_name) {
      res.$or = {
        ...(res.$or ? res.$or : {}),
        firstNameRu: { $iLike: `%${query.first_name}%` },
        firstNameEn: { $iLike: `%${query.first_name}%` },
      };
    }
    if (query.last_name) {
      res.$or = {
        ...(res.$or ? res.$or : {}),
        lastNameRu: { $iLike: `%${query.last_name}%` },
        lastNameEn: { $iLike: `%${query.last_name}%` },
      };
    }

  }

  if (query.departments) {
    res['$department.id$'] = {
      $in: query.departments,
    };
  }

  if (query.employment_date_from) {
    res.employment_date = {
      $gt: new Date(query.employment_date_from),
    };
  }
  if (query.employment_date_to) {
    res.employment_date = {
      ...(res.employment_date ? res.employment_date : {}),
      $lt: new Date(query.employment_date_to),
    };
  }
  if (query.birth_date_from) {
    res.birth_date = {
      $gt: new Date(query.birth_date_from),
    };
  }
  if (query.birth_date_to) {
    res.birth_date = {
      ...(res.birth_date ? res.birth_date : {}),
      $lt: new Date(query.birth_date_to),
    };
  }
  if (query.phone) {
    res.phone = { $iLike: `%${query.phone}%` };
  }
  if (query.telegram) {
    res.telegram = { $iLike: `%${query.telegram}%` };
  }
  if (query.city) {
    res.city = { $iLike: `%${query.city}%` };
  }

  return res;
};

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
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }

    const user = await models.User.findOne({
      where: {
        id: req.params.id,
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
            attributes: [],
          },
        },
      ],
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

exports.getUser = async function (req, res, next) {
  try {
    const ldapLogin = req.sanitize('ldapLogin').trim();
    req.checkQuery('ldapLogin', 'ldapLogin must be not empty').notEmpty();
    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }

    const user = await models.User.findOne({
      where: {
        ldapLogin: ldapLogin,
      },
      attributes: models.User.defaultSelect,
    });

    if (!user) {
      return next(createError(404, 'User not found'));
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
      if (!validationResult.isEmpty()) {
        return next(createError(400, validationResult));
      }
      const result = [];
      const userName = req.query.userName;
      const userNameArray = userName.trim().split(/\s+/);
      const iLikeFirstName = layoutAgnostic(userNameArray[0] ? userNameArray[0] : '');
      const iLikeLastName = layoutAgnostic(userNameArray[1] ? userNameArray[1] : '');

      const $or = [
        {
          firstNameEn: {
            $iLike: iLikeFirstName,
          },
          lastNameEn: {
            $iLike: iLikeLastName,
          },
        },
        {
          firstNameRu: {
            $iLike: iLikeFirstName,
          },
          lastNameRu: {
            $iLike: iLikeLastName,
          },
        },
        {
          firstNameEn: {
            $iLike: iLikeLastName,
          },
          lastNameEn: {
            $iLike: iLikeFirstName,
          },
        },
        {
          firstNameRu: {
            $iLike: iLikeLastName,
          },
          lastNameRu: {
            $iLike: iLikeFirstName,
          },
        },
      ];

      return models.User.findAll({
        where: {
          active: 1,
          $or,
        },
        limit: req.query.pageSize ? +req.query.pageSize : 10,
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn'],
      })
        .then(users => {
          users.forEach(user => {
            result.push({ fullNameRu: user.fullNameRu, fullNameEn: user.fullNameEn, id: user.id });
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
        'active',
        'photo',
        'skype',
        'emailPrimary',
        'mobile',
      ],
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
          $eq: 'DEV_OPS',
        },
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
        'mobile',
      ],
    });
    res.json(devOpsList);
  } catch (err) {
    next(err);
  }
};

exports.getUsersRoles = async function (req, res, next) {
  try {
    const {
      first_name,
      last_name,
      employment_date_from,
      employment_date_to,
      birth_date_from,
      birth_date_to,
      phone,
      telegram,
      city,
      departments,
    } = req.query;

    const filters = {
      employment_date_from,
      employment_date_to,
      birth_date_from,
      birth_date_to,
      city,
      departments,
      first_name,
      last_name,
      phone,
      telegram,
    };

    const stat = req.query.status !== null && req.query.status !== undefined ? req.query.status : true;

    let users_id = [];
    let deparmentWhere = {};


    if (departments) {

      const user_ids = await models.UserDepartments.findAll({
        attributes: [
          'user_id',
        ],
        raw: true,
        nest: true,
        where: {
          department_id: { $in: departments },
        },
      });

      users_id = user_ids.map(user => user.user_id);
      deparmentWhere = { where: { id: departments ? { $in: users_id} : { $gt: 0 }}};
    }

    const users = await models.User.findAll({
      where: {
        ...getWhereStatement(filters),
        active: stat === 'true' ? 1 : 0,
        globalRole: { $not: 'EXTERNAL_USER' },
      },
      order: [['last_name_ru']],
      attributes: [
        'id',
        'login',
        'firstNameRu',
        'firstNameEn',
        'lastNameRu',
        'lastNameEn',
        'birthDate',
        'globalRole',
        'employmentDate',
        'city',
        'telegram',
        'mobile',
        'active',
        'allowVPN',
        'dismissalDate',
        'delete_date',
      ],
      include: [userDepartmentInclude],
      ...deparmentWhere,
    });

    res.json(users);

  } catch (err) {
    next(err);
  }
};

exports.getInternalUsers = async function (req, res, next) {
  try {
    const stat = req.query.status !== null && req.query.status !== undefined ? req.query.status : true;

    const users = await models.User.findAll({
      where: {
        active: stat ? 1 : 0,
        globalRole: { $not: 'EXTERNAL_USER' },
      },
      order: [['last_name_ru']],
      attributes: ['id', 'ldapLogin', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'birthDate'],
    });

    const usersWithFilteredData = users.map(user => {
      const { id, ldapLogin, firstNameRu, lastNameRu, firstNameEn, lastNameEn, birthDate } = user;
      return {
        id,
        ldapLogin,
        firstNameRu,
        lastNameRu,
        firstNameEn,
        lastNameEn,
        birthDate,
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

    await model.updateAttributes({ globalRole }, { transaction });
    await transaction.commit();
    const user = await models.User.findOne({
      where: {
        id,
      },
      order: [['last_name_ru']],
      attributes: [
        'id',
        'login',
        'firstNameRu',
        'firstNameEn',
        'lastNameRu',
        'lastNameEn',
        'birthDate',
        'globalRole',
        'employmentDate',
        'city',
        'telegram',
        'mobile',
        'active',
        'allowVPN',
        'dismissalDate',
      ],
      include: [userDepartmentInclude],
    });
    res.json(user);


  } catch (err) {
    if (err) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.updateCurrentUserProfileByParams = async function (req, res, next) {
  const { id } = req.body;
  const user = req.body;

  const userAuth = req.user;

  if (!userAuth || userAuth.id !== id) {
    return next(createError(401));
  }

  if (userAuth.globalRole !== 'ADMIN') {
    return next(createError(401));
  }

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

    const newUser = {};

    newUser.mobile = user.mobile;
    newUser.phone = user.phone;
    newUser.birthDate = user.birthDate;
    newUser.skype = user.skype;
    newUser.photo = user.photo;

    const updatedModel = await model.updateAttributes(newUser, { transaction });
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

exports.updateCurrentUserProfile = async function (req, res, next) {
  const { id } = req.body;
  const user = req.body;

  const userAuth = req.user;

  if (!userAuth || userAuth.id !== id) {
    return next(createError(401));
  }
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const model = await User.findByPrimary(id, { transaction, lock: 'UPDATE' });
    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    //Если текущий пользователь не обновляет отдел, то пропускаем этот кусок.
    if (user.departmentList) {
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
    }

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

    const userLdap = await LDAP.searchUser(model.dataValues.ldapLogin);

    if (userLdap) {
      const deptNames
        = newDepartList && newDepartList.length > 0 ? newDepartList.map(({ name }) => name).join(', ') : '';
      const userLdapUpdated = await LDAP.modify(model.dataValues.ldapLogin, userLdap, { ...req.body, deptNames });
      if (!userLdapUpdated) {
        transaction.rollback();
        return next(createError(500));
      }
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
        login: uid,
      },
      attributes: models.User.defaultSelect,
    });

    if (userModel !== null) {
      return next(createError(403, 'user is already exist'));
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
      ...req.body,
    };
    for (const name in params) {
      if (params[name] === '') {
        delete params[name];
      }
    }

    const crpt = ssha.create(params.password);
    params.password = crpt;

    User.create(params)
      .then(async model => {
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

        await model.setDepartment(newDepartList, { transaction }).catch(err => {
          transaction.rollback();
          return next(err);
        });

        const objClone = { ...req.body };
        objClone.password = params.password;
        objClone.deptNames
          = newDepartList && newDepartList.length > 0 ? newDepartList.map(({ name }) => name).join(', ') : '';
        const userLdap = await LDAP.create(objClone);

        if (!userLdap) {
          transaction.rollback();
          return next(createError(500));
        }

        await transaction.commit();
        res.sendStatus(200);
      })
      .catch(err => {
        console.error('UserController: Catch error: ', err);

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
  const expiredDate = new Date(
    moment(req.body.expiredDate)
      .millisecond(999)
      .second(59)
      .minute(59)
      .hour(23)
  );
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
    expiredDate,
  };

  User.create(params)
    .then(model => {
      const template = emailService.template(
        'activateExternalUser',
        {
          token: setPasswordToken,
        },
        templateExternalUrl
      );
      emailService.send({
        receiver: req.body.login,
        subject: template.subject,
        html: template.body,
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
      setPasswordToken,
    };
    const updatedModel = await User.update(params, {
      where: { id: req.params.id },
    });
    const template = emailService.template(
      'activateExternalUser',
      {
        token: setPasswordToken,
      },
      templateExternalUrl
    );
    emailService.send({
      receiver: req.body.login,
      subject: template.subject,
      html: template.body,
    });
    res.json(updatedModel);
  } catch (err) {
    next(createError(500, `Error when refresh token. ${err.message} `));
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
      lock: 'UPDATE',
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

exports.deleteExternal = async function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  try {
    const isExistUser = await models.User.find({ where: { id: req.params.id } });
    if (!isExistUser) return createError(404, 'User is not exist');
    await models.User.destroy({ where: { id: req.params.id } });
    res.json(String(req.params.id));
  } catch (err) {
    next(err);
  }
};

exports.setPassword = async function (req, res, next) {
  try {
    req.checkBody('password', 'password must be more then 8 chars').isLength({ min: 8 });

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) {
      return next(createError(400, validationResult));
    }

    const user = await models.User.findOne({
      where: {
        setPasswordToken: req.params.token,
        setPasswordExpired: { $gt: Date.now() },
        globalRole: 'EXTERNAL_USER',
      },
      attributes: models.User.defaultSelect,
    });

    if (!user) {
      return next(createError(404, 'Password set token is invalid or has expired'));
    }

    const params = {
      isActive: 1,
      password: bcrypt.hashSync(req.body.password),
      setPasswordToken: null,
      setPasswordExpires: null,
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
        isTest: true,
      },
      attributes: models.User.defaultSelect,
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
        active: 1,
      },
      order: [['first_name_ru']],
      attributes: ['id', 'firstNameRu', 'globalRole', 'expiredDate', 'active', 'login', 'isActive', 'description'],
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
      if (!validationResult.isEmpty()) {
        return next(createError(400, validationResult));
      }

      const result = [];
      const userName = req.query.userName.trim();
      let $iLike = layoutAgnostic(userName);
      const reverseUserName = userName
        .split(' ')
        .reverse()
        .join(' '); //ищем Павла Ищейкина и Ищейкина Павла (хоть и пишем только в firstNameRu)
      let $or = [
        {
          firstNameRu: {
            $iLike,
          },
        },
      ];
      if (reverseUserName !== userName) {
        //Введено и имя и фамилия или их части
        $iLike = layoutAgnostic(reverseUserName);
        $or = $or.concat([
          {
            firstNameRu: {
              $iLike,
            },
          },
        ]);
      }
      return models.User.findAll({
        where: {
          globalRole: 'EXTERNAL_USER',
          active: 1,
          isActive: 1,
          $or,
        },
        limit: req.query.pageSize ? +req.query.pageSize : 10,
        attributes: [
          'id',
          'active',
          'firstNameRu',
          'lastNameRu',
          'firstNameEn',
          'lastNameEn',
          'fullNameRu',
          'fullNameEn',
        ],
      })
        .then(users => {
          users.forEach(user => {
            result.push({
              fullNameRu: user.fullNameRu,
              fullNameEn: user.fullNameEn,
              firstNameEn: user.firstNameEn,
              firstNameRu: user.firstNameRu,
              id: user.id,
            });
          });
          res.end(JSON.stringify(result));
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => next(createError(err)));
};
