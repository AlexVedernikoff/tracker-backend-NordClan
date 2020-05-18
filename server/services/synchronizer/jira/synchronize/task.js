const models = require('../../../../models');
const { Task } = models;

/**
 * Синхронизация задач
 * @param {Array} tasks - массив из задач
 */
exports.synchronizeTasks = async function (tasks, projectId) {
  const extIds = tasks.map(s => s.externalId);
  let createdTasks = await Task.findAll({
    where: { externalId: { $in: extIds }, projectId }
  });
  const newTasks = tasks.filter(t => {
    const ind = createdTasks.findIndex(ct => {
      if (ct.externalId === t.externalId) return true;
    });
    if (ind === -1) return t;
  });

  //обновление созданных тасок
  if (createdTasks.length > 0) {
    createdTasks = createdTasks.map(cs => cs.dataValues);

    // отсеить из тасок созданные и их обновить в цикле
    tasks.map(async (t, i) => {
      const ind = createdTasks.findIndex(ct => {
        return t.externalId.toString() === ct.id.toString();
      });
      if (ind >= -1) {
        const updObj = tasks[i];
        await Task.update(updObj, {
          where: { externalId: t.externalId.toString() }
        });
      }
    });
  }

  // создание новых задач
  if (newTasks.length > 0) await Task.bulkCreate(newTasks);
  return Task.findAll({
    where: { externalId: { $in: extIds }, projectId }
  });
};
