const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
  if(!req.params.taskId) return next(createError(400, 'taskId need'));
  if(!Number.isInteger(+req.params.taskId)) return next(createError(400, 'taskId must be int'));
  if(+req.params.taskId <= 0) return next(createError(400, 'taskId must be > 0'));

  let taskModel;
  let userModel;

  // Удаление исполнителя
  if(+req.body.userId === 0) {
    queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId', 'performerId'])
      .then((model) => {
        const newAttribures = {};
        newAttribures.performerId = null;
        if(+req.body.statusId > 0) newAttribures.statusId = +req.body.statusId;
        
        return model.updateAttributes(newAttribures)
          .then(() =>
            res.json({
              statusId: req.body.statusId? +req.body.statusId : model.statusId,
              performer: null
            })
          );
        
      })
      .catch((err) => {
        next(err);
      });
    return;
  }

  if(!req.body.userId) return next(createError(400, 'userId need'));
  if(!Number.isInteger(+req.body.userId)) return next(createError(400, 'userId must be int'));
  if(+req.body.userId <= 0) return next(createError(400, 'userId must be > 0'));
  

  Promise.all([
    queries.user.findOneActiveUser(req.body.userId, models.User.defaultSelect)
      .then((model) => { userModel  = model; }),
    queries.task.findOneActiveTask(req.params.taskId, ['id', 'statusId', 'performerId'])
      .then((model) => { taskModel = model; })
  ])
    .then(() => {
      if(+taskModel.statusId === models.TaskStatusesDictionary.CLOSED_STATUS) return next(createError(400, 'Task is closed'));

      const newAttribures = {};
      if(+req.body.userId > 0) newAttribures.performerId = +req.body.userId;
      if(+req.body.statusId > 0) newAttribures.statusId = +req.body.statusId;
  
      return taskModel.updateAttributes(newAttribures)
        .then(() =>
          res.json({
            statusId: req.body.statusId? +req.body.statusId : taskModel.statusId,
            performer: userModel
          })
        );
    })
    .catch((err) => {
      next(err);
    });

};
