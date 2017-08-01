const createError = require('http-errors');
const moment = require('moment');
const _ = require('underscore');
const models = require('../models');
const Project = require('../models').Project;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const Portfolio = require('../models').Portfolio;
const Sprint = require('../models').Sprint;
const queries = require('../models/queries');


exports.create = function(req, res, next){
  if(req.body.tags) {
    req.body.tags.split(',').map(el=>el.trim()).forEach(el => {
      if(el.length < 2) throw createError(400, 'tag must be more then 2 chars');
    });
  }
  
  Project.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Project
    .create(req.body)
    .then((model) => {
      return queries.tag.saveTagsForModel(model, req.body.tags)
        .then(() => {
          if(!req.body.portfolioId && req.body.portfolioName) return queries.project.savePortfolioToProject(model, req.body.portfolioName);
        })
        .then(() => res.end(JSON.stringify({id: model.id})));
    })
    .catch((err) => {
      next(err);
    });
};


exports.read = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Project
    .findByPrimary(req.params.id, {
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
          as: 'sprints',
          model: Sprint,
          attributes: ['id', 'name', 'factStartDate', 'factFinishDate', 'statusId', 'allottedTime'],
          order: [['factFinishDate', 'DESC'], ['name', 'ASC']],
        },
        {
          as: 'portfolio',
          model: Portfolio,
          attributes: ['id', 'name'],
        },
        {
          as: 'users',
          model: models.User,
          attributes: ['id', 'firstNameRu', 'lastNameRu'],
          through: {
            as: 'projectUsers',
            model: models.ProjectUsers,
            attributes: ['rolesIds']
          },
        },
        {
          as: 'attachments',
          model: models.ProjectAttachments,
          attributes: models.ProjectAttachments.defaultSelect,
          order: [
            ['createdAt', 'ASC']
          ]
        }
      ]
    })
    .then((model) => {
      if(!model) return next(createError(404));

      if(model.users) {
        model.users.forEach((user, key) => {
          model.users[key] = {
            id: user.id,
            fullNameRu: user.fullNameRu,
            rolesIds: JSON.parse(user.projectUsers.rolesIds),
          };
        });
      }

      if(model.dataValues.tags) model.dataValues.tags = Object.keys(model.dataValues.tags).map((k) => model.dataValues.tags[k].name); // Преобразую теги в массив
      delete model.dataValues.portfolioId;
      res.end(JSON.stringify(model.dataValues));
    })
    .catch((err) => {
      next(err);
    });

};


exports.update = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  const attributes = ['id', 'portfolioId'].concat(Object.keys(req.body));
  const resultRespons = {};
  let portfolioIdOld;
  
  Project
    .findByPrimary(req.params.id, { attributes: attributes })
    .then((project) => {
      if(!project) { return next(createError(404)); }

      // сброс портфеля
      if (+req.body.portfolioId === 0) {
        req.body.portfolioId = null;
        portfolioIdOld = project.portfolioId;
      }


      return project
        .updateAttributes(req.body)
        .then((model)=>{

          // Запускаю проверку портфеля на пустоту и его удаление
          if(portfolioIdOld) queries.portfolio.checkEmptyAndDelete(portfolioIdOld);

          resultRespons.id = model.id;
          // Получаю измененные поля
          _.keys(model.dataValues).forEach((key) => {
            if(req.body[key])
              resultRespons[key] = model.dataValues[key];
          });

          res.end(JSON.stringify(resultRespons));
        });

    })
    .catch((err) => {
      next(err);
    });

};


exports.delete = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  
  Project.findByPrimary(req.params.id, { attributes: ['id'] })
    .then((project) => {
      if(!project) { return next(createError(404)); }

      return project.destroy()
        .then(()=>{
          res.end();
        });
    })
    .catch((err) => {
      next(err);
    });

};


exports.list = function(req, res, next){
  if(req.query.dateSprintBegin && !req.query.dateSprintBegin.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if(req.query.dateSprintEnd && !req.query.dateSprintEnd.match(/^\d{4}-\d{2}-\d{2}$/)) return next(createError(400, 'date must be in YYYY-MM-DD format'));
  if(req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if(req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if(req.query.portfolioId && !req.query.portfolioId.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if(req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());
    Project.checkAttributes(req.query.fields);
  }
  
  if(!req.query.pageSize) {
    req.query.pageSize = 25;
  }
  
  if(!req.query.currentPage) {
    req.query.currentPage = 1;
  }
  
  
  let resultProjects = {};
  let queryIncludes = [];
  let where = {
    deletedAt: {$eq: null} // IS NULL
  };
  
  
  if(req.query.portfolioId) {
    where.portfolioId = req.query.portfolioId;
  }

  if(req.query.name) {
    where.name = { $iLike: '%' + req.query.name + '%' };
  }
  
  if(req.query.statusId) {
    where.statusId = {
      in: req.query.statusId.toString().split(',').map((el)=>el.trim())
    };
  }

  // вывод текущего спринта
  queryIncludes.push({
    as: 'currentSprints',
    model: Sprint,
    attributes: ['name', 'factStartDate', 'factFinishDate', 'id', 'projectId'],
    order: [
      ['factStartDate', 'DESC'],
    ],
    where: {
      factStartDate: {
        $lte: moment().format('YYYY-MM-DD') // factStartDate <= now
      },
      factFinishDate: {
        $gte: moment().format('YYYY-MM-DD') // factFinishDate >= now
      },
      deletedAt: {
        $eq: null // IS NULL
      }
    },
    separate: true
  });

  // вывод тегов
  queryIncludes.push({
    model: ItemTag,
    as: 'itemTag',
    where: {
      taggable: 'project'
    },
    separate: true,
    include: [{
      as: 'tag',
      model: Tag,
      attributes: ['name'],
    }],
  });

  // Порфтель
  queryIncludes.push({
    as: 'portfolio',
    model: Portfolio,
    attributes: ['id','name']
  });
  
  // Фильтрация по дате
  const queryFactStartDate = {};
  const queryFactFinishDate = {};
  
  if(req.query.dateSprintBegin) {
    queryFactStartDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
    queryFactFinishDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
  }

  if(req.query.dateSprintEnd) {
    queryFactStartDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
    queryFactFinishDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
  }

  if(req.query.dateSprintBegin || req.query.dateSprintEnd) {
    queryIncludes.push({
      as: 'sprintForQuery',
      model: Sprint,
      attributes: [],
      where: {
        $or: [
          {
            factStartDate: queryFactStartDate
          },
          {
            factFinishDate: queryFactFinishDate
          }
        ]

      }
    });
  }
  
  Promise.resolve()
    // Фильтрация по тегам ищем id тегов
    .then(() => {
      if(req.query.tags) {
        return Tag
          .findAll({
            where: {
              name: {
                $or: req.query.tags.split(',').map((el) => el.trim().toLowerCase())
              }
            }
          });
      }
    })
    // Включаем фильтрация по тегам в запрос
    .then((tags) => {
      if(tags) {
        queryIncludes.push({
          model: ItemTag,
          as: 'itemTag',
          required: true,
          attributes: [],
          where: {
            tag_id: {
              $or: tags.map(el => el.dataValues.id),
            },
          },
        });
      }
    })
    .then(() => {
      return Project
        .findAll({
          attributes: req.query.fields ? _.union(['id','portfolioId','name','statusId', 'createdAt'].concat(req.query.fields)) : '',
          limit: req.query.pageSize,
          offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
          include: queryIncludes,
          where: where,
          order: [
            ['statusId', 'ASC'],
            ['createdAt', 'ASC'],
          ],
          subQuery: true,
        })
        .then(projects => {

          return Project
            .count({
              include: queryIncludes,
              where: where,
              group: ['Project.id']
            })
            .then((count) => {
              count = count.length;


              if(projects) {
                for(let key in projects) {
                  let row = projects[key].dataValues;
                  
                  if(row.itemTag) row.tags = Object.keys(row.itemTag).map((k) => row.itemTag[k].tag.name); // Преобразую теги в массив
                  row.elemType = 'project';
                  delete row.itemTag;
                  delete row.portfolioId;
                  
                  if(row.currentSprints && row.currentSprints[0]) { // преобразую спринты
                    row.currentSprints = [row.currentSprints[0]];
                  }
                  
                  projects[key].dataValues = row;
                }
                
                resultProjects = projects;
              }


              let responseObject = {
                currentPage: +req.query.currentPage,
                pagesCount: Math.ceil(count / req.query.pageSize),
                pageSize: req.query.pageSize,
                rowsCountAll: count,
                rowsCountOnCurrentPage: projects.length,
                data: resultProjects,
              };
              res.end(JSON.stringify(responseObject));

            });

        });
    })
    .catch(err => next(err));

};


exports.setStatus = function(req, res, next){
  if(!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  if(!req.body.statusId) return next(createError(400, 'statusId need'));
  if(!req.body.statusId.match(/^[0-9]+$/)) return next(createError(400, 'statusId must be integer'));
  

  const attributesForUpdate = {
    statusId: req.body.statusId,
    finishedAt: +req.body.statusId === 3 ? new Date() : null // Если проект завершен, то ставим finishedAt, иначе убираем
  };

  Project
    .findByPrimary(req.params.id, { attributes: ['id'] })
    .then((project) => {
      if(!project) throw createError(404);

      return project
        .updateAttributes(attributesForUpdate)
        .then((model)=>{
          res.end(JSON.stringify({
            id: model.id,
            statusId: model.statusId
          }));
        });
    })
    .catch((err) => {
      next(err);
    });
};
