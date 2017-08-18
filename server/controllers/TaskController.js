const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const Task = require('../models').Task;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const queries = require('../models/queries');
const moment = require('moment');


exports.create = function(req, res, next){
  if(req.body.tags) {
    req.body.tags.split(',').map(el=>el.trim()).forEach(el => {
      if(el.length < 2) throw createError(400, 'tag must be more then 2 chars');
    });
  }
  
  Task.beforeValidate((model) => {
    model.authorId = req.user.id;
  });
  
  Task.create(req.body)
    .then((model) => {
      return queries.tag.saveTagsForModel(model, req.body.tags, 'task')
        .then(() => res.json({id: model.id}));
    })
    .catch((err) => {
      next(err);
    });

};


exports.read = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  Task.findByPrimary(req.params.id, {
    include: [
      {
        as: 'tags',
        model: Tag,
        attributes: ['name'],
        through: {
          model: ItemTag,
          attributes: []
        },
        order: [
          ['name', 'ASC'],
        ],
      },
      {
        as: 'project',
        model: models.Project,
        attributes: ['id', 'name', 'prefix']
      },
      {
        as: 'parentTask',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'author',
        model: models.User,
        attributes: models.User.defaultSelect
      },
      {
        as: 'subTasks',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'linkedTasks',
        model: models.Task,
        through: {
          model: models.TaskTasks,
          attributes: []
        },
        attributes: ['id', 'name']
      },
      {
        as: 'sprint',
        model: models.Sprint,
        attributes: ['id', 'name']
      },
      {
        as: 'performer',
        model: models.User,
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'],
      },
      {
        as: 'attachments',
        model: models.TaskAttachments,
        attributes: models.TaskAttachments.defaultSelect,
        order: [
          ['createdAt', 'ASC']
        ]
      }
    ]
  })
    .then((model) => {
      if(!model) return next(createError(404));
      if(model.dataValues.tags) model.dataValues.tags = Object.keys(model.dataValues.tags).map((k) => model.dataValues.tags[k].name); // Преобразую теги в массив

      res.json(model.dataValues);
    })
    .catch((err) => {
      next(err);
    });

};


exports.update = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  const attributes = ['id', 'statusId'].concat(Object.keys(req.body));
  const resultRespons = {};

  return models.sequelize.transaction({ isolationLevel: models.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED }, function (t) {

    return Task.findByPrimary(req.params.id, { attributes: attributes, transaction: t, lock: 'UPDATE' })
      .then((row) => {
        if(!row) return next(createError(404));

        if(+row.statusId === models.TaskStatusesDictionary.CLOSED_STATUS) { // Изменяю только статус если его передали
          if(!req.body.statusId) return next(createError(400, 'Task is closed'));
          req.body = {
            statusId: req.body.statusId
          };
        }

        // сброс задаче в бек лог
        if(+req.body.sprintId === 0) {
          resultRespons.sprint = {
            id: 0,
            name: 'Backlog'
          };
          req.body.sprintId = null;
        }

        if(+req.body.parentId === 0) {
          resultRespons.parentTask = null;
          req.body.parentId = null;
        }


        return row.updateAttributes(req.body, { transaction: t })
          .then((model)=>{

            return Promise.resolve()
              .then(() => {
                // Если хотели изменить спринт, присылаю его обратно
                if(+req.body.sprintId > 0) {
                  return Task.findByPrimary(req.params.id, {
                    attributes: ['id'],
                    transaction: t,
                    include: [
                      {
                        as: 'sprint',
                        model: models.Sprint,
                        attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
                      }
                    ]
                  })
                    .then(model => {
                      if(model.sprint) resultRespons.sprint = model.sprint;
                    });
                }
              })
              .then(() => {

                resultRespons.id = model.id;
                // Получаю измененные поля
                _.keys(model.dataValues).forEach((key) => {
                  if(req.body[key])
                    resultRespons[key] = model.dataValues[key];
                });

                res.json(resultRespons);

              });

          });
      });
  })
    .catch((err) => {
      next(err);
    });

};


exports.delete = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  Task.findByPrimary(req.params.id, { attributes: ['id'] })
    .then((row) => {
      if(!row) { return next(createError(404)); }

      row.destroy()
        .then(()=>{
          res.end();
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });

};


exports.list = function(req, res, next){
  if(req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if(req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if(req.query.performerId && !req.query.performerId.toString().match(/^\d+$/)) return next(createError(400, 'performerId must be int'));

  let prefixNeed = false;

  if(req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());
    if (req.query.fields.indexOf('prefix') !== -1) prefixNeed = true;
    if (prefixNeed) req.query.fields.splice(req.query.fields.indexOf('prefix'), 1);

    Task.checkAttributes(req.query.fields);
  }
  
  if(!req.query.pageSize && !req.query.projectId && !req.query.sprintId) {
    req.query.pageSize = 100;
  } else if(!req.query.pageSize && (req.query.projectId || req.query.sprintId)) {
    req.query.pageSize = null;
  }
  
  if(!req.query.currentPage) {
    req.query.currentPage = 1;
  }
  
  let where = {
    deletedAt: {$eq: null} // IS NULL
  };
  
  if(+req.query.performerId) {
    where.performerId = +req.query.performerId;
  }
  
  if(req.query.name) {
    where.name = {
      $iLike: '%' + req.query.name + '%'
    };
  }
  
  // Если +req.query.statusId === 0 или указан спринт вывожу все статусы, если указаны конкретные вывожу их.
  if(req.query.statusId && +req.query.statusId !== 0) {
    where.statusId = {
      in: req.query.statusId.toString().split(',').map((el)=>el.trim())
    };
  }

  if(!req.query.statusId) {
    where.statusId = {
      $notIn: [9, 10], // По умолчанию показываю все не отмененные и ине закрытые (см. словарь статусов TaskStatusesDictionary)
    };
  }
  
  if(req.query.tags) {
    req.query.tags = req.query.tags.split(',').map((el) => el.toString().trim().toLowerCase());
  }
  
  if(req.query.projectId) {
    where.projectId = {
      in: req.query.projectId.toString().split(',').map((el)=>el.trim())
    };
  }
  
  if(req.query.sprintId) {
    if(+req.query.sprintId === 0) {
      where.sprintId = {
        $eq: null
      };
    } else {
      where.sprintId = {
        in: req.query.sprintId.toString().split(',').map((el)=>el.trim())
      };
    }
  }

  const includeAuthor = {
    as: 'author',
    model: models.User,
    attributes: models.User.defaultSelect
  };
  
  const includePerformer = {
    as: 'performer',
    model: models.User,
    attributes: models.User.defaultSelect,
  };
  
  const includeSprint = {
    as: 'sprint',
    model: models.Sprint,
    attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime'],
  };
  
  const includeTagSelect = {
    as: 'tags',
    model: Tag,
    attributes: ['name'],
    through: {
      model: ItemTag,
      attributes: []
    },
    order: [
      ['name', 'ASC'],
    ],
  };
  
  const includeTagConst = {
    model: Tag,
    as: 'tagForQuery',
    required: true,
    attributes: [],
    where: {
      name: {
        $or: req.query.tags,
      },
    },
    through: {
      model: ItemTag,
      attributes: []
    }
  };

  const includeProject = {
    as: 'project',
    model: models.Project,
    attributes: ['prefix'],
  };


  let includeForSelect = [];
  includeForSelect.push(includeAuthor);
  includeForSelect.push(includePerformer);
  includeForSelect.push(includeSprint);
  includeForSelect.push(includeTagSelect);
  if(prefixNeed) includeForSelect.push(includeProject);
  
  let includeForCount = [];
  if(req.query.tags) includeForCount.push(includeTagConst);
  if(req.query.performerId)  includeForCount.push(includePerformer);

  
  Promise.resolve()
  // Фильтрация по тегам ищем id тегов
    .then(() => {
      if(req.query.tags)
        return Tag
          .findAll({
            where: {
              name: {
                $in: req.query.tags
              }
            }
          });
      
      return [];
    })
    // Включаем фильтрация по тегам в запрос
    .then((tags) => {
      tags.forEach(tag => {
        includeForSelect.push({
          association: Task.hasOne(models.ItemTag, {
            as: 'itemTag' + tag.id,
            foreignKey: {
              name: 'taggableId',
              field: 'taggable_id'
            },
            scope: {
              taggable: 'task'
            }
          }),
          attributes: [],
          required: true,
          where: {
            tag_id: tag.id,
          },
        });
      });
    })
    .then(() => {
      return Task
        .findAll({
          attributes: req.query.fields ? _.union(['id','name','authorId', 'performerId', 'sprintId', 'statusId', 'prioritiesId', 'projectId'].concat(req.query.fields)) : '',
          limit: req.query.pageSize,
          offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
          include: includeForSelect,
          where: where,
          order: [
            // Первым вывожу текущий спринт, потом остальное
            // Не работает в данной версии sequelize
            // [models.sequelize.literal('CASE WHEN "sprint"."fact_start_date" <= now() AND "sprint"."fact_finish_date" >= now() THEN 1 ELSE 2 END')],
            // [models.sequelize.literal('"sprint"."fact_start_date" ASC')],
            ['statusId', 'ASC'],
            ['prioritiesId', 'ASC'],
            ['name', 'ASC'],
          ],
        })
        .then(tasks => {
    
          return Task
            .count({
              where: where,
              include: includeForCount,
              group: ['Task.id']
            })
            .then((count) => {
        
              count = count.length;

              if(prefixNeed) {
                tasks.forEach((task) => {
                  task.dataValues.prefix = task.project.prefix;
                  delete task.dataValues.project;
                });
              }

              tasks = _.sortBy(tasks, (project) => {
                if (project.sprint === null) return 999999999999999;
                
                const startDate = moment(project.sprint.factStartDate).format('X');
                const finisDate = moment(project.sprint.factFinishDate).format('X');
                const now = moment().format('X');
                
                if (startDate <= now && finisDate >= now ) return 1;
                return startDate;
              });
              
  
              const responseObject = {
                currentPage: +req.query.currentPage,
                pagesCount: (req.query.pageSize) ? Math.ceil(count / req.query.pageSize) : 1,
                pageSize: (req.query.pageSize) ? req.query.pageSize : count,
                rowsCountAll: count,
                rowsCountOnCurrentPage: tasks.length,
                data: tasks
              };
              res.json(responseObject);
        
            });
        });
    })
    .catch((err) => {
      next(err);
    });
  
  
  
};


exports.setStatus = function(req, res, next){
  if(req.params.taskId && !req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  if(!req.body.statusId) return next(createError(400, 'statusId must be'));
  if(req.body.statusId && !req.body.statusId.match(/^[0-9]+$/)) return next(createError(400, 'statusId must be int'));
  
  Task.build( {id: req.params.taskId, statusId: req.body.statusId}).validate({fields: ['id', 'statusId']})
    .then(validate => {
      if(validate) throw createError(validate);
    })
    .then(() => {
      return Task
        .findByPrimary(req.params.taskId, { validate: true, attributes: ['id' ,'statusId'] })
        .then((task) => {
          if(!task) { return next(createError(404)); }

          return task
            .updateAttributes({
              statusId: req.body.statusId
            })
            .then((model)=>{
              res.json({
                id: model.id,
                statusId: +model.statusId
              });
            });
        });
    })
    .catch((err) => {
      next(err);
    });
};
