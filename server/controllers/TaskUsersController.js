const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  if(!req.body.taskId) return next(createError(400, 'taskId need'));
  if(!Number.isInteger(+req.body.taskId)) return next(createError(400, 'taskId must be int'));
  if(+req.body.taskId <= 0) return next(createError(400, 'taskId must be > 0'));
  
  let taskStatusId;

  if(+req.body.userId === 0) {
    queries.task.findOneActiveTask(req.body.taskId, ['id', 'statusId'])
      .then((model) => {
        taskStatusId = model.statusId;
        return models.TaskUsers.destroy({
          where: {
            taskId: req.body.taskId,
            deletedAt: null
          }
        })
          .then(()=>{
            if(req.body.statusId) {
              return models.Task.update({
                statusId: req.body.statusId
              }, {
                where: {
                  id: req.body.taskId
                }
              });
            }
          })
          .then(() => res.end(JSON.stringify({
            statusId: req.body.statusId? +req.body.statusId : taskStatusId,
            performer: null
          })));
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
    queries.task.findOneActiveTask(req.body.taskId, ['id', 'statusId'])
      .then((model) => {
        taskStatusId = model.statusId;
      })
  ])
    .then(() => {
      return models.TaskUsers
        .findAll({where: {
          taskId: req.body.taskId,
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
                  taskId: req.body.taskId
                });
              }
            })
            .then(() => {
              if(req.body.statusId) {
                return models.Task.update({
                  statusId: req.body.statusId
                }, {
                  where: {
                    id: req.body.taskId
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
                  res.end(JSON.stringify(responce));
                });

            });
        });
    })
    .catch((err) => {
      next(err);
    });

};

