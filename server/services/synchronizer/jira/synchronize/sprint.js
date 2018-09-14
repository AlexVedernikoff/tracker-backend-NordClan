const models = require('../../../models');
const { Sprint } = models;

/**
 * Синхронизация спринтов
 * @param {Array} data - массив из спринтов, подготовленный для записи.
 */
exports.synchronizeSprints = async function (sprints) {
  const extIds = sprints.map(s => s.externalId);
  let createdSprints = await Sprint.findAll({ where: { externalId: { $in: extIds } } });
  const newSprints = sprints.filter(spr => {
    const ind = createdSprints.findIndex(cspr => {
      if (cspr.externalId === spr.externalId) return true;
    });
    if (ind === -1) return spr;
  });

  //обновление созданных спринтов
  if (createdSprints.length > 0) {
    createdSprints = createdSprints.map(cs => cs.dataValues);

    // отсеить из спринтов созданные и их обновить в цикле
    sprints.map(async (s, i) => {
      const ind = createdSprints.findIndex(cspr => {
        return s.externalId.toString() === cspr.id.toString();
      });
      if (ind >= -1) {
        const updObj = sprints[i];
        await Sprint.update(updObj, { where: { externalId: s.externalId.toString() } });
      }
    });

  }

  // создание новых спринтов
  if (newSprints.length > 0) await Sprint.bulkCreate(newSprints);
  return newSprints.concat(createdSprints);
};


// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ СРАВНЕНИЯ И ОБНОВЛЕНИЯ
