const models = require('../../../../models');
const { Timesheet } = models;

/**
 * Синхронизация таймшитов
 * @param {Array} timesheets - массив из задач
 */
exports.synchronizeTimesheets = async function (timesheets, projectId) {
  const extIds = timesheets.map(s => s.externalId);
  let createdTimesheets = await Timesheet.findAll({
    where: { externalId: { $in: extIds }, projectId }
  });
  const newTimesheets = timesheets.filter(t => {
    const ind = createdTimesheets.findIndex(ct => {
      if (ct.externalId === t.externalId) return true;
    });
    if (ind === -1) return t;
  });

  //обновление созданных таймшитов
  if (createdTimesheets.length > 0) {
    createdTimesheets = createdTimesheets.map(cs => cs.dataValues);

    // отсеить из таймшитов созданные и обновить в цикле
    timesheets.map(async (t, i) => {
      const ind = createdTimesheets.findIndex(ct => {
        return t.externalId.toString() === ct.id.toString();
      });
      if (ind >= -1) {
        const updObj = timesheets[i];
        await Timesheet.update(updObj, {
          where: { externalId: t.externalId.toString() }
        });
      }
    });
  }

  // создание новых таймшитов
  if (newTimesheets.length > 0) await Timesheet.bulkCreate(newTimesheets);

  return Timesheet.findAll({
    where: { externalId: { $in: extIds }, projectId }
  });
};
