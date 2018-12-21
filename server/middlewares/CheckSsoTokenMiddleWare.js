const createError = require('http-errors');
const models = require('../models/index');
const User = models.User;
const ProjectUsers = models.ProjectUsers;
const Project = models.Project;

exports.checkSsoToken = function (req, res, next) {
  const { email } = req.kauth.grant.access_token.content;

  if (/\/auth\/login$/iu.test(req.url) || (/\/user\/password/iu).test(req.url)) {
    return next();
  }

  User.findOne({
    where: {
      emailPrimary: email,
      active: 1
    },
    attributes: User.defaultSelect,
    include: [
      {
        as: 'usersProjects',
        model: ProjectUsers,
        attributes: ['projectId'],
        include: [
          {
            as: 'roles',
            model: models.ProjectUsersRoles
          }
        ],
        required: false
      },
      {
        as: 'authorsProjects',
        model: Project,
        attributes: ['id'],
        required: false
      },
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
  })
    .then(user => {
      if (!user) {
        return next(createError(401, 'No found user or access in the system. Or access token has expired'));
      }
      if (user.dataValues.department[0]) {
        user.dataValues.department = user.dataValues.department[0].name;
      }

      req.user = user;

      return next();
    })
    .catch(err => next(err));
};
