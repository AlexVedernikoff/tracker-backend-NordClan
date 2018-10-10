const TasksService = require('./synchronize/task');
const TimesheetService = require('./synchronize/timesheet');
const SprintService = require('./synchronize/sprint');
const models = require('../../../models');
const moment = require('moment');
const createError = require('http-errors');
const {
  Project,
  TaskStatusesAssociation,
  TaskTypesAssociation,
  UserEmailAssociation,
  User
} = models;
const request = require('./../request');
const config = require('../../../configs');

/**
 * @param data - Данные для синхронизации
 */
exports.jiraSync = async function (headers, data) {
  let resTimesheets, resSprints, resTasks;

  // Подгрузка ассоциаций
  const [
    taskStatusesAssociation,
    taskTypesAssociation,
    userEmailAssociation
  ] = await Promise.all([
    TaskStatusesAssociation.findAll({}),
    TaskTypesAssociation.findAll({}),
    UserEmailAssociation.findAll({})
  ]);

  // подгрузка хостнейма джиры по токену
  const jiraHostname = await getJiraHostname(headers);

  // Подготовка проекта
  const [{ projectId }] = data;
  const project = await Project.findOne({
    where: { externalId: projectId, jiraHostname }
  });

  // Подготовка пользователей
  let users = await getJiraProjectUsers(headers, projectId);

  users = users.map(u => u.email);
  let usersAssociation = await UserEmailAssociation.findAll({
    where: { externalUserEmail: { $in: users } }
  });
  usersAssociation = usersAssociation.map(ua => ua.internalUserEmail);
  users = await User.findAll({
    where: { emailPrimary: { $in: usersAssociation } }
  });

  /**
   * Модуль со спринтами
   */
  const sprintsObj = {};
  data.map(task => {
    if (task.sprint && !Object.keys(sprintsObj).includes(task.sprint.id)) {
      sprintsObj[task.sprint.id] = {
        name: task.sprint.name,
        authorId: project.authorId
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

  try {
    resSprints = await SprintService.synchronizeSprints(sprints);
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }

  /**
   * Модуль с задачами
   */

  const tasks = data.map(task => {
    let sInd;
    if (task.sprint) {
      sInd = resSprints.findIndex(
        sp => sp.externalId.toString() === task.sprint.id.toString()
      );
    }

    const statusAssociation = taskStatusesAssociation.find(tsa => {
      return (
        tsa.projectId === project.id
        && tsa.externalStatusId.toString() === task.status
      );
    });

    const typeAssociation = taskTypesAssociation.find(tsa => {
      return (
        tsa.projectId === project.id
        && tsa.externalTaskTypeId.toString() === task.type
      );
    });

    const t = Object.assign(
      {},
      {
        externalId: task.id.toString(),
        name: task.summary,
        factExecutionTime: task.timeSpent / 100,
        sprintId: sInd >= 0 ? resSprints[sInd].id : null,
        typeId: typeAssociation.internalTaskTypeId,
        statusId: statusAssociation.internalStatusId,
        authorId: project.authorId,
        projectId: project.id
      }
    );
    return t;
  });

  try {
    resTasks = await TasksService.synchronizeTasks(tasks);
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }

  /**
   * Модуль с таймшитами
   */

  let timesheets = [];

  data.map(task => {
    if (task.worklogs && task.worklogs.length !== 0) {
      const ts = task.worklogs.map(worklog => {
        // Поиск пользователя
        const ueassociation = userEmailAssociation.find(ua => {
          return ua.externalUserEmail === worklog.assignee;
        });
        const user = users.find(u => {
          return u.emailPrimary === ueassociation.internalUserEmail;
        });
        // ------------------
        // Поиск спринта
        let sprint;
        if (task.sprint) {
          sprint = resSprints.find(sp => {
            return sp.externalId === task.sprint.id.toString();
          });
        }

        // ------------------
        // Поиск задачи
        const tsk = resTasks.find(t => {
          return t.externalId === task.id.toString();
        });
        // ------------------
        return {
          ...{
            taskId: tsk.id,
            sprintId: sprint ? sprint.id : null,
            userId: user.id,
            onDate: moment(new Date(worklog.onDate)).format('YYYY-MM-DD'), // поправить
            spentTime: worklog.timeSpent / 100,
            externalId: worklog.id,
            comment: worklog.comment,
            typeId: 1,
            statusId: 1,
            projectId: project.id,
            isBillable: true
          }
        };
      });
      timesheets = [...timesheets, ...ts];
    }
  });

  try {
    resTimesheets = await TimesheetService.synchronizeTimesheets(timesheets);
  } catch (e) {
    throw createError(400, 'Invalid input data');
  }

  return { resSprints, resTasks, resTimesheets };
};

/**
 * @param {string} id
 * @param {string} authorId
 */
exports.createProject = async function (headers, id, authorId, prefix) {
  const { data: jiraProject } = await request.get(
    `${config.ttiUrl}/project/${id}`,
    {
      headers
    }
  );
  const users = await getJiraProjectUsers(headers, id);

  let project = await Project.create({
    name: jiraProject.name,
    createdBySystemUser: true,
    externalId: jiraProject.id,
    authorId,
    prefix
  });
  project = {
    ...project.dataValues,
    ...{ issue_types: jiraProject.issue_types },
    ...{ status_types: jiraProject.status_type },
    ...{ users }
  };
  return project;
};

/**
 * @param {object} projectId - id проекта в симтреке
 * @param {object} issueTypesAssociation
 * @param {object} statusesAssociation
 */
exports.setProjectAssociation = async function (
  projectId,
  issueTypesAssociation,
  statusesAssociation,
  userEmailAssociation
) {
  const ita = issueTypesAssociation.map(it => {
    it.projectId = projectId;
    return it;
  });

  const sa = statusesAssociation.map(s => {
    s.projectId = projectId;
    return s;
  });

  const ua = userEmailAssociation.map(u => {
    u.projectId = projectId;
    return u;
  });

  const beforeCreateRes = await Promise.all([
    TaskTypesAssociation.findAll({ where: { projectId } }),
    TaskStatusesAssociation.findAll({ where: { projectId } }),
    UserEmailAssociation.findAll({ where: { projectId } })
  ]);
  if (
    beforeCreateRes[0].length !== 0
    || beforeCreateRes[1].length !== 0
    || beforeCreateRes[2].length !== 0
  ) {
    throw new Error(400, 'Project already has associations');
  }

  await Promise.all([
    TaskTypesAssociation.bulkCreate(ita),
    TaskStatusesAssociation.bulkCreate(sa),
    UserEmailAssociation.bulkCreate(ua)
  ]);

  const [taskTypes, taskStatuses, userEmail] = await Promise.all([
    TaskTypesAssociation.findAll({ where: { projectId } }),
    TaskStatusesAssociation.findAll({ where: { projectId } }),
    UserEmailAssociation.findAll({ where: { projectId } })
  ]);

  return { taskTypes, taskStatuses, userEmail };
};

exports.jiraAuth = async function (username, password, server) {
  return request.post(`${config.ttiUrl}/auth`, {
    username,
    password,
    server
  });
};

exports.getJiraProjects = async function (headers) {
  try {
    return request.get(`${config.ttiUrl}/projects`, { headers });
  } catch (e) {
    throw e;
  }
};

exports.getActiveSimtrackProjects = async function () {
  try {
    return Project.findAll({
      where: {
        statusId: 1,
        externalId: {
          $ne: null
        }
      }
    });
  } catch (e) {
    throw e;
  }
};

/**
 * @param projectId - id проекта в джире
 */
async function getJiraProjectUsers (headers, projectId) {
  const { data: users } = await request.get(
    `${config.ttiUrl}/project/${projectId}/users`,
    {
      headers
    }
  );
  return users;
}

async function getJiraHostname (headers) {
  const { data: hostname } = await request.get(`${config.ttiUrl}/trololo`, {
    headers
  });
  return hostname;
}
