const createError = require('http-errors');
const models = require('../');
const { NOTAG } = require('../../components/utils');

exports.name = 'tag';

exports.getAllTagsByModel = function (modelName, modelId, t = null) {
  return models[modelName]
    .findByPrimary(modelId, {
      attributes: ['id'],
      transaction: t,
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
            ['name', 'ASC']
          ]
        }
      ]
    })
    .then((model) => {
      if (!model) return createError(404, 'taggable model not found');
      const row = model.dataValues;
      let result = [];
      if (row.tags){
        result = Object.keys(row.tags).map((k) => row.tags[k].name); // Преобразую теги в массив
      }

      return result;
    });
};

// Обработчик тегов при создании записи проекта, задачи
exports.saveTagsForModel = function (Model, tagsString, taggable, userId) {
  let tags = [];
  if (tagsString) {
    tags = tagsString.toString().split(',');
  }

  /** Прорверка спец. тега No tag. Нельзя создать тег "No tag". см. констану **/
  tags.forEach(function (tag) {
    if (NOTAG.indexOf(tag.toLowerCase()) !== -1) {
      throw createError(400, 'tag must be not equal "' + NOTAG.join('", "') + '"');
    }
  });

  let chain = Promise.resolve();

  tags.forEach(function (itemTag) {
    chain = chain.then(() => {
      return models.Tag
        .findOrCreate({where: {name: itemTag.toString().trim().toLowerCase()} })
        .spread((tag) => {
          return models.ItemTag
            .findOrCreate({
              where: {
                tagId: tag.id,
                taggableId: Model.id,
                taggable: taggable
              },
              historyAuthorId: userId
            });
        })
        .catch((err) => {
          if (err) throw createError(err);
        });
    });
  });

  return chain;
};
