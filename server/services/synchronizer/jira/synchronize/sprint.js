const models = require('../../../../models');
const { Sprint } = models;

/**
 * Синхронизация спринтов
 * @param {Array} data - массив из спринтов, подготовленный для записи.
 */
exports.synchronizeSprints = async function (sprints, projectId) {
  const extIds = sprints.map(s => s.externalId);
  const createdSprints = await Sprint.findAll({
    where: {
      externalId: {
        $in: extIds
      },
      projectId
    }
  });

  //обновление созданных спринтов
  if (createdSprints.length > 0) {

    // отсеить из спринтов созданные и их обновить в цикле
    sprints.map(async (s, i) => {
      const index = createdSprints.findIndex(cspr => {
        return s.externalId.toString() === cspr.dataValues.id.toString();
      });
      if (index >= -1) {
        const updObj = sprints[i];
        await Sprint.update(updObj, {
          where: { externalId: s.externalId.toString() }
        });
      }
    });
  }

  const newSprints = sprints.filter(spr => createdSprints.findIndex(cspr => cspr.dataValues.externalId === spr.externalId) === -1);
  // создание новых спринтов
  if (newSprints.length > 0) {
    await Sprint.bulkCreate(newSprints);
  }

  return Sprint.findAll({
    where: { externalId: { $in: extIds }, projectId }
  });
};
