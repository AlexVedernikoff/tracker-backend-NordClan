const TasksService = require('./synchronize/task');
const SprintService = require('./synchronize/sprint');
const models = require('../../../models');
const createError = require('http-errors');
const { Project, TaskStatusesAssociation, TaskTypesAssociation } = models;
const request = require('./../request');
const config = require('../../../configs');

/**
 * @param data - Данные для синхронизации
 */
exports.jiraSync = async function (data) {
  const taskProjectIds = data.map(task => task.projectId.toString());
  const projects = await Project.findAll({
    where: { externalId: { $in: taskProjectIds } }
  });

  /**
   * Модуль со спринтами
   */
  const sprintsObj = {};
  data.map(task => {
    const ind = projects.findIndex(p => {
      return p.externalId.toString() === task.projectId.toString();
    });
    if (!Object.keys(sprintsObj).includes(task.sprint.id) && ind >= 0) {
      sprintsObj[task.sprint.id] = {
        name: task.sprint.name,
        authorId: projects[ind].authorId
      };
    }
  });
  const sprints = [];
  for (const key in sprintsObj) {
    sprints.push({
      externalId: key,
      name: sprintsObj[key].name,
      authorId: sprintsObj[key].authorId
    });
  }

  let resSprints;
  try {
    resSprints = await SprintService.synchronizeSprints(sprints);
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }
  // return resSprints;

  /**
   * Модуль с задачами
   */

  const [taskStatusesAssociation, taskTypesAssociation] = await Promise.all([
    TaskStatusesAssociation.findAll({}),
    TaskTypesAssociation.findAll({})
  ]);

  const tasks = data.map(task => {
    const pInd = projects.findIndex(p => {
      return p.externalId.toString() === task.projectId.toString();
    });
    const sInd = resSprints.findIndex(
      sp => sp.externalId.toString() === task.sprint.id.toString()
    );
    const statusAssociation = taskStatusesAssociation.find(tsa => {
      return (
        tsa.projectId === projects[pInd].id
        && tsa.externalTaskTypeId === task.typeId
      );
    });

    const typeAssociation = taskTypesAssociation.find(tsa => {
      return (
        tsa.projectId === projects[pInd].id
        && tsa.externalTaskTypeId === task.typeId
      );
    });
    const t = Object.assign(
      {},
      {
        externalId: task.id.toString(),
        name: task.summary,
        factExecutionTime: task.timeSpent,
        sprintId: resSprints[sInd].id,
        typeId: typeAssociation.internalTaskTypeId,
        statusId: statusAssociation.internalStatusId,
        authorId: projects[pInd].authorId,
        projectId: projects[pInd].id
      }
    );
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

// создание проекта
// создание ассоциаций со статусами
// создание ассоциаций с типами задач
// отправлять пользователя на страницу создания ассоциаций если
// не была закончена

/**
 * @param {string} key - ключ проекта
 */
exports.createProject = async function (key) {
  const jiraProject = await request.getRequest(
    `${config.ttiUrl}/project/${key}`
  );
  let project = await Project.create({
    name: jiraProject.name,
    createdBySysUser: true,
    externalId: jiraProject.id
  });
  project = {
    ...project,
    ...jiraProject.issue_types,
    ...jiraProject.status_type
  };
  return project;
};

/**
 *
 * @param {object} issueTypesAssociation
 * @param {object} statusesAssociation
 */
exports.setProjectAssociation = async function (
  projectId,
  issueTypesAssociation,
  statusesAssociation
) {
  const ita = issueTypesAssociation.map(it => {
    it.projectId = projectId;
    return it;
  });

  const sa = statusesAssociation.map(s => {
    s.projectId = projectId;
    return s;
  });

  const beforeCreateRes = await Promise.all([
    TaskTypesAssociation.findAll({ where: { projectId } }),
    TaskStatusesAssociation.findAll({ where: { projectId } })
  ]);
  if (beforeCreateRes[0].length !== 0 || beforeCreateRes[0].length !== 0) {
    throw new Error(400, 'Project already has associations');
  }

  await Promise.all([
    TaskTypesAssociation.bulkCreate(ita),
    TaskStatusesAssociation.bulkCreate(sa)
  ]);

  const afterCreateRes = await Promise.all([
    TaskTypesAssociation.findAll({ where: { projectId } }),
    TaskStatusesAssociation.findAll({ where: { projectId } })
  ]);

  return { taskTypes: afterCreateRes[0], taskStatuses: afterCreateRes[1] };
};

exports.jiraAuth = async function (username, password, server) {
  return request.postRequest(`${config.ttiUrl}/auth`, {
    username,
    password,
    server
  });
};
