const createError = require('http-errors');
const models = require('../models');

exports.me = function(req, res, next){
  new UserController(req, res, next, req.user.id)
    .sendUserInfo();
};

exports.read = function(req, res, next){
  req.sanitize('id').trim();
  req.checkParams('id', 'id must be int').notEmpty().isInt();
  req.getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));
      
      new UserController(req, res, next, req.params.id)
        .sendUserInfo()
        .catch((err) => {
          next(err);
        });
      
    })
    .catch((err) => next(createError(err)));
};

exports.autocomplete = function(req, res, next) {
  req.sanitize('userName').trim();
  req.checkQuery('userName', 'userName must be not empty' ).notEmpty();
  req.getValidationResult()
    .then((validationResult) => {
      if (!validationResult.isEmpty()) return next(createError(400, validationResult));
  
      let result = [];
  
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
              },
            ],
        
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
            },
          },
          {
            model: models.ProjectUsers,
            as: 'userProjects',
            attributes: ['projectId', 'rolesIds', 'authorId'],
            required: false,
          },
          {
            model: models.Project,
            as: 'createdProjects',
            attributes: ['id', 'name', 'authorId'],
            required: false,
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

        user.dataValues.projects = [];
        user.dataValues.createdProjects = [];

        // console.log(userProjects);
        // console.log(createdProjects);

        user.userProjects.map(el => {
          let a = this.req.user.Access.project(el.projectId);
          console.log(a);
          user.dataValues.projects.push(a);
        });


        user.createdProjects.map(el => {
          let a = this.req.user.Access.project(el.id);
          console.log(a);
          user.dataValues.createdProjects.push(a);
        });





        delete user.dataValues.userProjects;
        delete user.dataValues.createdProjects;
        this.res.json(user);
      })
      .catch((err) => {
        this.next(createError(err));
      });
  }



}
