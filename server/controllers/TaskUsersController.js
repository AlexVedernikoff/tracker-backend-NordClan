const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  if(!req.params.taskId) return next(createError(400, 'taskId need'));
  if(!Number.isInteger(+req.params.taskId)) return next(createError(400, 'taskId must be int'));
  if(+req.params.taskId <= 0) return next(createError(400, 'taskId must be > 0'));
  
  let taskStatusId;

  if(+req.body.userId === 0) {
    queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId'])
      .then((model) => {
        taskStatusId = model.statusId;
        return models.TaskUsers.destroy({
          where: {
            taskId: req.params.taskId,
            deletedAt: null
          }
        })
          .then(()=>{
            if(req.body.statusId) {
              return models.Task.update({
                statusId: req.body.statusId
              }, {
                where: {
                  id: req.params.taskId
                }
              });
            }
          })
          .then(() => res.json({
            statusId: req.body.statusId? +req.body.statusId : taskStatusId,
            performer: null
          }));
      })
      .catch((err) => {
        next(err);
      });
    return;
  }

  if(!req.body.userId) return next(createError(400, 'userId need'));
  if(!Number.isInteger(+req.body.userId)) return next(createError(400, 'userId must be int'));
  if(+req.body.userId <= 0) return next(createError(400, 'userId must be > 0'));
  let needCreateNewPerfomer = true;


  models.TaskUsers.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Promise.all([
    queries.user.findOneActiveUser(req.body.userId),
    queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId'])
      .then((model) => {
        taskStatusId = model.statusId;
      })
  ])
    .then(() => {
      return models.TaskUsers
        .findAll({where: {
          taskId: req.params.taskId,
          deletedAt: null
        }})
        .then((taskOldUser) => {
          let chain = Promise.resolve();

          taskOldUser.forEach((oldUser) => {
            if(oldUser.userId!==+req.body.userId) {
              chain = chain.then(() => {
                return oldUser.destroy();
              });
            } else {
              needCreateNewPerfomer = false;
            }
          });

          return chain
            .then(() => {
              if(needCreateNewPerfomer) {
                return models.TaskUsers.create({
                  userId: req.body.userId,
                  taskId: req.params.taskId
                });
              }
            })
            .then(() => {
              if(req.body.statusId) {
                return models.Task.update({
                  statusId: req.body.statusId
                }, {
                  where: {
                    id: req.params.taskId
                  }
                });
              }
            })
            .then(() => {
              return queries.user.findOneActiveUser(req.body.userId, ['id', 'fullNameRu', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'])
                .then((user) => {
                  const responce = {
                    performer: user.dataValues,
                    statusId: req.body.statusId? +req.body.statusId : taskStatusId
                  };
                  res.json(responce);
                });

            });
        });
    })
    .catch((err) => {
      next(err);
    });

};
