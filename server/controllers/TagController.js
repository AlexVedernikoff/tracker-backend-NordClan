const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const StringHelper = require('../components/StringHelper');

exports.list = function(req, res, next){
  
  req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
  req.checkParams('taggableId', 'taggableId must be int').isInt();
  req
    .getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));
  
      return queries.tag.getAllTagsByModel(StringHelper.firstLetterUp(req.params.taggable), req.params.taggableId)
        .then((tags) => {
          res.json(tags);
        });
    })
    .catch((err) => next(createError(err)));
};

exports.create = function(req, res, next){
  req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
  req.checkParams('taggableId', 'taggableId must be int').isInt();
  req.checkBody('tag', 'tag must be more then 2 chars').isLength({min: 2});
  req
    .getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));


      return models.sequelize.transaction(function (t) {
        return models[StringHelper.firstLetterUp(req.params.taggable)]
          .findByPrimary(req.params.taggableId, { attributes: ['id'], transaction: t })
          .then((model) => {
            if(!model) return next(createError(404, 'taggable model not found'));

            return queries.tag.saveTagsForModel(model, req.body.tag, req.params.taggable)
              .then(() => {
                return queries.tag.getAllTagsByModel(StringHelper.firstLetterUp(req.params.taggable), model.id, t)
                  .then((tags) => {
                    res.json(tags);
                  });
              });
          });
      });
    })
    .catch((err) => next(createError(err)));
};

exports.delete = function(req, res, next){
  req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
  req.checkParams('taggableId', 'taggableId must be int').isInt();
  req.checkParams('tag', 'tag must be more then 1 char').isLength({min: 1});
  req
    .getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));


      return models.sequelize.transaction(function (t) {
        return models.Tag
          .find({where: {name: req.params.tag.trim()}, attributes: ['id'], transaction: t })
          .then((tag) => {
            if(!tag) return next(createError(404, 'tag not found'));

            return models.ItemTag
              .findOne({ where: {
                tagId: tag.dataValues.id,
                taggableId: req.params.taggableId,
                taggable: req.params.taggable,
              }, transaction: t, lock: 'UPDATE' })
              .then((item) => {
                if(!item) return next(createError(404, 'ItemTag not found'));
                return item
                  .destroy({transaction: t})
                  .then(() => {
                    return queries.tag.getAllTagsByModel(StringHelper.firstLetterUp(req.params.taggable), req.params.taggableId, t)
                      .then((tags) => {
                        res.json(tags);
                      });

                  });
              });
          });
      });

    })
    .catch((err) => next(createError(err)));
};

exports.autocompliter = function(req, res, next){
  let resultResponse = [];

  req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task',  'project']);
  req.checkQuery('tagName', 'tag must be more then 2 chars').isLength({min: 2});
  req.getValidationResult()
    .then((validationResult) => {
      if(!validationResult.isEmpty()) return next(createError(400, validationResult));

      return models.Tag.findAll({
        distinct: 'name',
        attributes: ['name'],
        group: ['Tag.id', 'Tag.name'],
        where: {
          name: {
            $iLike: '%' + req.query.tagName + '%'
          },
        },
        include: [
          {
            as: 'itemTags',
            model: models.ItemTag,
            attributes: [],
            required: true,
            where: {
              taggable: req.params.taggable.trim()
            },
          }
        ],
      })
        .then((tags)=>{
          tags.forEach((tag) => {
            resultResponse.push(tag.name);
          });
          res.json(resultResponse);
        });
      
    })
    .catch((err) => next(createError(err)));
};
