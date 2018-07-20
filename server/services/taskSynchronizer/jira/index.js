const TasksService = require('../syncMethods/task');
const SprintService = require('../syncMethods/sprint');
const models = require('../../../models');
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
      sprintsObj[task.sprint.id] = {name: task.sprint.name, authorId: projects[ind].authorId};
    }
  });
  const sprints = [];
  for (const key in sprintsObj) {
    sprints.push({ externalId: key, name: sprintsObj[key].name, authorId: sprintsObj[key].authorId });
  }
  const resSprints = await SprintService.synchronizeSprints(sprints); // тут должны быть все спринты которые пришли в исходном обьекте
  return resSprints;
  /**
    * Модуль с задачами
    */
  /*
  const tasks = data.map(task => {
    const ind = resSprints.findIndex(sp => sp.externalId === task.sprint.id ? true : false);
    const t = Object.assign({}, { externalId: task.id, name: task.summary, factExecutionTime: task.timeSpent, sprintId: resSprints[ind].id }); /* typeId, statusId, authorId */
  /*   delete t.worklogs;
    return t;
  });

  const resTasks = await TasksService.createMany(tasks); // тут должны быть все спринты которые пришли в исходном обьекте
  /**
   * Модуль с таймшитами
   */
};

// когда создается проект, аккаунт-менеджер из джиры подгружает типы задач, баги фичи итд и аккаунт прокидывает связи. 
