const TasksService = require('../syncMethods/task');
const SprintService = require('../syncMethods/task');
const models = require('../../../models');
const { Project } = models;


/**
 * @param data - Данные для синхронизации
 */
exports.jiraSync = async function (data) {
  // тело сервиса. Вся логика будет тут
  /**
   *  
   * Приходят данные за неделю. по externalId сравниваем таски если нет заводим новую, если есть обновляем старую
   * 
   * */
  // req.body =  [{},{}]; задачи - это будут ишьюсы
  const taskProjects = data.map((task) => task.projectId);

  // проекты задействованные в джире
  const projects = await Project.findAll({ where: { externalId: { in: taskProjects } } });

  /**
   * Модуль со спринтами
   */
  const sprintsObj = {};
  data.map(task => {
    if (!Object.keys(sprintsObj).includes(task.sprint.id)) {
      sprintsObj[task.sprint.id] = task.sprint.name;
    }
  });
  const sprints = [];
  for (const key in sprintsObj) {
    sprints.push({ externalId: key, name: sprintsObj[key] }); /*authorId*/
  }

  const resSprints = await SprintService.synchronizeSprints(sprints); // тут должны быть все спринты которые пришли в исходном обьекте

  /**
    * Модуль с задачами
    */
  const tasks = data.map(task => {
    const ind = resSprints.findIndex(sp => sp.externalId === task.sprint.id ? true : false);
    const t = Object.assign({}, { externalId: task.id, name: task.summary, factExecutionTime: task.timeSpent, sprintId: resSprints[ind].id }); /* typeId, statusId, authorId */
    delete t.worklogs;
    return t;
  });

  const resTasks = await TasksService.createMany(tasks); // тут должны быть все спринты которые пришли в исходном обьекте
  /**
   * Модуль с таймшитами
   */
};

// когда создается проект, аккаунт-менеджер из джиры подгружает типы задач, баги фичи итд и аккаунт прокидывает связи. 
