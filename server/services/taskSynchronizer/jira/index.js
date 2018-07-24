const TasksService = require('../syncMethods/task');
const SprintService = require('../syncMethods/sprint');
const models = require('../../../models');
const createError = require('http-errors');
const { Project } = models;


/**
 * @param data - Данные для синхронизации
 */
exports.jiraSync = async function (data) {
  // тело сервиса. Вся логика тут
  /**
   *  
   * Приходят данные за неделю. по externalId сравниваем таски если нет заводим новую, если есть обновляем старую
   * 
   * */
  // req.body =  [{},{}]; задачи - это будут ишьюсы
  const taskProjectIds = data.map((task) => task.projectId.toString());

  // проекты задействованные в джире
  const projects = await Project.findAll({ where: { externalId: { $in: taskProjectIds } } });

  /**
   * Модуль со спринтами
   */
  // Проставление спринту значения author_id из автора проекта.
  const sprintsObj = {};
  data.map(task => {
    const ind = projects.findIndex((p) => {
      return p.externalId.toString() === task.projectId.toString();
    });
    if (!Object.keys(sprintsObj).includes(task.sprint.id) && ind >= 0) {
      sprintsObj[task.sprint.id] = { name: task.sprint.name, authorId: projects[ind].authorId };
    }
  });
  const sprints = [];
  for (const key in sprintsObj) {
    sprints.push({ externalId: key, name: sprintsObj[key].name, authorId: sprintsObj[key].authorId });
  }

  let resSprints;
  try {
    resSprints = await SprintService.synchronizeSprints(sprints); // тут должны быть все спринты которые пришли в исходном обьекте
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }

  // return resSprints;

  /**
    * Модуль с задачами
    */

  const tasks = data.map(task => {
    const pInd = projects.findIndex((p) => {
      return p.externalId.toString() === task.projectId.toString();
    });
    const sInd = resSprints.findIndex(sp => sp.externalId.toString() === task.sprint.id.toString());
    const t = Object.assign({}, {
      externalId: task.id.toString(),
      name: task.summary,
      factExecutionTime: task.timeSpent,
      sprintId: resSprints[sInd].id,
      typeId: 1, // тестовое значение до реализации функционала
      statusId: 1, // тестовое значение до реализации функционала
      authorId: projects[pInd].authorId,
      projectId: projects[pInd].id
    });
    return t;
  });

  let resTasks;
  try {
    resTasks = await TasksService.synchronizeTasks(tasks);
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }

  return resTasks;


  /**
   * Модуль с таймшитами
   */

};

// когда создается проект, аккаунт-менеджер из джиры подгружает типы задач, баги фичи итд и аккаунт прокидывает связи. 
