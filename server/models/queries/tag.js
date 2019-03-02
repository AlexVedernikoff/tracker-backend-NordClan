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
          order: [['name', 'ASC']]
        }
      ]
    })
    .then(model => {
      if (!model) return createError(404, 'taggable model not found');

      const {
        dataValues: { tags = [] }
      } = model;

      return tags.map(({ name }) => name);
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
  let tagId = null;

  tags.forEach(function (itemTag) {
    chain = chain.then(() => {
      return models.Tag.findOrCreate({
        where: {
          name: itemTag
            .toString()
            .trim()
            .toLowerCase()
        }
      })
        .spread(tag => {
          tagId = tag.id;
          return models.ItemTag.findOne({
            where: {
              tagId: tag.id,
              taggableId: Model.id,
              taggable: taggable
            },
            historyAuthorId: userId,
            paranoid: false
          });
        }).then(tagResponse => {
          if (tagResponse) {
            return tagResponse.restore();
          } else {
            return models.ItemTag.create({
              tagId: tagId,
              taggableId: Model.id,
              taggable: taggable
            }, {
              historyAuthorId: userId
            });
          }
        })
        .catch(err => {
          if (err) throw createError(err);
        });
    });
  });

  return chain;
};

exports.getAllTaskTagsByProject = async projectId => {
  const [rows] = await models.sequelize.query(
    `
    SELECT tg.name
    FROM tags tg
    JOIN item_tags it ON it.tag_id = tg.id AND it.taggable='task'
    JOIN tasks tk ON it.taggable_id = tk.id
    WHERE tk.project_id = :projectId
    GROUP BY tg.id;
  `,
    { replacements: { projectId } }
  );
  return rows;
};
