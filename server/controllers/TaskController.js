const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const Task = require('../models').Task;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const queries = require('../models/queries');


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
      return queries.tag.saveTagsForModel(model, req.body.tags)
        .then(() => res.end(JSON.stringify({id: model.id})));
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
        through: {
          model: models.TaskUsers,
          attributes: []
        },
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

      if(model.dataValues.performer[0]) {
        model.dataValues.performer = model.dataValues.performer[0];
      } else {
        model.dataValues.performer = null;
      }

      res.end(JSON.stringify(model.dataValues));
    })
    .catch((err) => {
      next(err);
    });

};


exports.update = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  let resultRespons = {};

  Task.findByPrimary(req.params.id, { attributes: ['id'] })
    .then((row) => {
      if(!row) { return next(createError(404)); }

      // сброс задаче в бек лог
      if(+req.body.sprintId === 0) req.body.sprintId = null;


      row.updateAttributes(req.body)
        .then((model)=>{

          resultRespons.id = model.id;
          // Получаю измененные поля
          _.keys(model.dataValues).forEach((key) => {
            if(req.body[key])
              resultRespons[key] = model.dataValues[key];
          });

          res.end(JSON.stringify(resultRespons));

        })
        .catch((err) => {
          next(err);
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
  if(req.query.performerId && !req.query.performerId.match(/^\d+$/)) return next(createError(400, 'performerId must be int'));
  if(req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());
    Task.checkAttributes(req.query.fields);
  }
  
  let where = {
    deletedAt: {$eq: null} // IS NULL
  };
  
  if(req.query.name) {
    where.name = {
      $iLike: '%' + req.query.name + '%'
    };
  }
  
  if(req.query.statusId) {
    where.statusId = {
      in: req.query.statusId.toString().split(',').map((el)=>el.trim())
    };
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
  } else {
    where.statusId = {
      $notIn: [9], // По умолчанию показываю все не отмененные
    };
  }
  
  
  let includePerformer = {
    as: 'performer',
    model: models.User,
    attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'],
    through: {
      model: models.TaskUsers,
      attributes: [],
      
    },
    where: req.query.performerId ? {
      id: req.query.performerId
    } : {}

  };

  let includeSprint = {
    as: 'sprint',
    model: models.Sprint,
    attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
  };

  let includeForCount = {
    model: Tag,
    as: 'tagForQuery',
    required: true,
    attributes: [],
    where: {
      name: {
        $or: req.query.tags ? req.query.tags.split(',').map((el) => el.trim()) : [],
      },
    },
    through: {
      model: ItemTag,
      attributes: []
    }
  };

  let includeForQuery = {
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

  Task
    .findAll({
      attributes: req.query.fields ? _.union(['id','name'].concat(req.query.fields)) : '',
      limit: req.query.pageSize ? +req.query.pageSize : 1000,
      offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
      include: req.query.tags ? [includeForCount, includeForQuery , includePerformer, includeSprint] : [includeForQuery, includePerformer, includeSprint],
      where: where,
      subQuery: true,
      order: [
        ['prioritiesId', 'ASC'],
        ['name', 'ASC'],
      ],
    })
    .then(projects => {

      Task
        .count({
          where: where,
          include: req.query.tags ? [includeForCount] : [],
          group: ['Task.id']
        })
        .then((count) => {

          count = count.length;

          let projectsRows = projects ?
            projects.map(
              item => {
                if(item.dataValues.performer[0]) {
                  item.dataValues.performer = item.dataValues.performer[0];
                } else {
                  item.dataValues.performer = null;
                }
                return item.dataValues;
              }

            ) : [];

          let responseObject = {
            currentPage: req.query.currentPage ? +req.query.currentPage : 1,
            pagesCount: Math.ceil(count / (req.query.pageSize ? req.query.pageSize : 1)),
            pageSize: req.query.pageSize ? +req.query.pageSize : +count,
            rowsCountAll: count,
            rowsCountOnCurrentPage: projectsRows.length,
            data: projectsRows
          };
          res.end(JSON.stringify(responseObject));

        })
        .catch((err) => {
          next(err);
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
        .findByPrimary(req.params.taskId, { validate: true, attributes: ['id'] })
        .then((task) => {
          if(!task) { return next(createError(404)); }

          return task
            .updateAttributes({
              statusId: req.body.statusId
            })
            .then((model)=>{
              res.end(JSON.stringify({
                id: model.id,
                statusId: +model.statusId
              }));
            });
        });
    })
    .catch((err) => {
      next(err);
    });
};
