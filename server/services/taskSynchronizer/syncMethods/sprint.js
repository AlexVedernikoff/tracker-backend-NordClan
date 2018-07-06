const models = require('../../../models');
const { Sprint } = models;


/**
 * Синхронизация спринтов
 * @param {Array} data - массив из спринтов, подготовленный для записи.
 */
exports.synchronizeSprints = async function (sprints) {
  const extIds = sprints.map(s => s.externalId);
  let createdSprints = await Sprint.findAll({ where: { externalId: { $in: extIds } } });
  let newSprints = sprints.filter(spr => {
    const ind = createdSprints.findIndex(cspr => {
      if (cspr.externalId === spr.externalId) return true;
    });
    if (ind === -1) return spr;
  });
  // если нет спринта с таким экстерналом то создавать новый либо обновлять текущий
  if (createdSprints.length > 0) createdSprints = await Sprint.update(createdSprints, { where: { externalId: { $in: extIds } } });
  if (newSprints.length > 0) newSprints = await Sprint.bulkCreate(newSprints);
  return newSprints.concat(createdSprints);
};


// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ СРАВНЕНИЯ И ОБНОВЛЕНИЯ
