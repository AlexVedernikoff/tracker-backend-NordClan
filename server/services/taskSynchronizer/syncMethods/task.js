const models = require('../../../models');
const { Task } = models;


/**
 * Синхронизация задач
 * @param {Array} data - массив из задач
 */
exports.synchronizeTasks = async function (data) {
  const tasks = await Task.bulkCreate(data);
  return tasks; // тут должны быть все задачи которые пришли в исходном обьекте
};


// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ СРАВНЕНИЯ И ОБНОВЛЕНИЯ
