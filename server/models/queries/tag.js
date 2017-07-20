const createError = require('http-errors');
const models = require('../');

exports.name = 'tag';

exports.getAllTagsByModel = function(modelName, modelId) {
  return models[modelName]
    .findByPrimary(modelId, {
      attributes: ['id'],
      include: [
        {
          as: 'tags',
          model: models.Tag,
          attributes: ['name'],
          through: {
            model: models.ItemTag,
            attributes: []
          },
          order: [
            ['name', 'ASC'],
          ],
        }
      ],
    })
    .then((model) => {
      if(!model) return createError(404, 'taggable model not found');
      let row = model.dataValues;
      let result = [];
      if(row.tags){
        result = Object.keys(row.tags).map((k) => row.tags[k].name); // Преобразую теги в массив
      }

      return result;
    });
};

// Обработчик тегов при создании записи проекта, задачи, спринта
exports.saveTagsForModel = function(Model, tagsString) {
  let tags = [];
  if(tagsString) {
    tags = tagsString.toString().split(',');
  }

  let chain = Promise.resolve();

  tags.forEach(function(itemTag) {
    chain = chain.then(() => {
      return models.Tag
        .findOrCreate({where: {name: itemTag.trim()}})
        .spread((tag) => {
          return Model
            .addTag(tag);
        })
        .catch((err) => {
          if(err) throw createError(err);
        });
    });
  });

  return chain;
};