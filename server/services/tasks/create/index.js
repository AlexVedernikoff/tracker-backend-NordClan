const models = require('../../../models');
const { Task } = models;

exports.create = async function (params) {
  const task = await Task.create(params, { returning: true });
  if (params.tags) {
    const tags = params.tags.split(',');
    await saveTagsForModel(task, tags);
  }
  return task;
};

async function saveTagsForModel (task, tags) {
  tags.forEach(async (itemTag) => {
    await models.Tag
      .findOrCreate({where: {name: itemTag.toLowerCase()} })
      .spread(async (tag) => {
        await models.ItemTag
          .findOrCreate({
            where: {
              tagId: tag.id,
              taggableId: task.id,
              taggable: 'task',
            },
          });
      });
  });
}
