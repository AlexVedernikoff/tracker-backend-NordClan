const createError = require('http-errors');
const models = require('../../../models');

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

exports.all = async function (req, res, next) {
  try {

    const users = await models.User
      .findAll({
        where: {
          active: 1
        },
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'globalRole']
      });

    const usersSorted = users.sort((user1, user2) => {
      if (user1.lastNameRu > user2.lastNameRu){
        return 1;
      }
      if (user1.lastNameRu < user2.lastNameRu) {
        return -1;
      }
      return 0;
    });
    res.json(usersSorted);

  } catch (err) {
    next(err);
  }

};

exports.updateUserRole = async function (req, res, next) {
  console.log(' ');
  console.log(req.body);
  console.log(' ');
  console.log(' ');
  console.log(req.user.dataValues.globalRole);
  console.log(' ');
  res.json(req.body);
};
