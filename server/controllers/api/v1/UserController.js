const createError = require('http-errors');
const models = require('../../../models');
const bcrypt = require('bcrypt-nodejs');
const { User } = models;
const config = require('../../../configs');
const crypto = require('crypto');
const emailService = require('../../../services/email');

exports.me = function (req, res, next){
  try {
    res.json(req.user);
  } catch (e) {
    return next(createError(e));
  }
};

exports.read = async function (req, res, next){
  try {
    req.sanitize('id').trim();
    req.checkParams('id', 'id must be int').notEmpty().isInt();

    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) return next(createError(400, validationResult));

    const user = await models.User
      .findOne({
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
  req.getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));

      const result = [];

      return models.User
        .findAll({
          where: {
            active: 1,
            $or: [
              {
                fullNameRu: {
                  $iLike: '%' + req.query.userName.trim() + '%'
                }
              },
              {
                fullNameRu: {
                  $iLike: '%' + req.query.userName.split(' ').reverse().join(' ').trim() + '%'
                }
              }
            ]
          },
          limit: req.query.pageSize ? +req.query.pageSize : 10,
          attributes: ['id', 'firstNameRu', 'lastNameRu']
        })
        .then((users) => {

          users.forEach((user) => {
            result.push({fullNameRu: user.fullNameRu, id: user.id});
          });
          res.end(JSON.stringify(result));
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => next(createError(err)));
};

exports.getUsersRoles = async function (req, res, next) {
  try {

    const users = await models.User
      .findAll({
        where: {
          active: 1,
          globalRole: { $not: 'EXTERNAL_USER' },
        },
        order: [
          ['last_name_ru']
        ],
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'globalRole']
      });

    const usersWithFilteredData = users.map(user => {
      const {id, firstNameRu, lastNameRu, globalRole} = user;
      return {
        id,
        firstNameRu,
        lastNameRu,
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

  return models.sequelize.transaction(function (t) {
    return User.findByPrimary(id, { transaction: t, lock: 'UPDATE' })
      .then((model) => {
        if (!model) {
          return next(createError(404));
        }

        return model.updateAttributes({ globalRole }, { transaction: t })
          .then((updatedModel) => {
            const updatedUser = {
              id: updatedModel.id,
              globalRole: updatedModel.globalRole,
              firstNameRu: updatedModel.firstNameRu,
              lastNameRu: updatedModel.lastNameRu
            };
            res.json(updatedUser);
          });
      });
  })
    .catch((err) => {
      next(err);
    });
};

exports.createExternal = async function (req, res, next){
  const buf = crypto.randomBytes(20);
  const setPasswordToken = buf.toString('hex');
  const setPasswordExpired = Date.now() + config.externalUser.setPasswordTokenLifetime;

  const params = {
    active: 0,
    globalRole: 'EXTERNAL_USER',
    ldapLogin: req.body.login,
    createdAt: new Date(),
    updatedAt: new Date(),
    setPasswordToken,
    setPasswordExpired,
    ...req.body
  };

  User.create(params)
    .then((model) => {
      const template = emailService.template('activateExternalUser', { token: setPasswordToken });
      emailService.send({
        receiver: req.body.login,
        subject: template.subject,
        html: template.body
      });
      res.json(model);
    })
    .catch((err) => {
      next(err);
    });
};

exports.setPassword = async function (req, res, next){
  try {
    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) return next(createError(400, validationResult));

    const user = await models.User
      .findOne({
        where: {
          setPasswordToken: req.params.token,
          setPasswordExpired: { $gt: Date.now() },
          globalRole: 'EXTERNAL_USER'
        },
        attributes: models.User.defaultSelect
      });

    if (!user) return next(createError(404, 'Password set token is invalid or has expired'));

    const params = {
      active: 1,
      password: bcrypt.hashSync(req.body.password),
      setPasswordToken: null,
      setPasswordExpires: null
    };

    user.updateAttributes(params)
      .then(updatedModel => res.json(updatedModel));

  } catch (e) {
    return next(createError(e));
  }
};

exports.getExternalUsers = async function (req, res, next) {
  try {

    const users = await models.User
      .findAll({
        where: {
          globalRole: 'EXTERNAL_USER',
        },
        order: [
          ['first_name_ru']
        ],
        attributes: ['id', 'firstNameRu', 'globalRole', 'expiredDate', 'active', 'login']
      });

    res.json(users);

  } catch (err) {
    next(err);
  }

};