const TasksService = require('./synchronize/task');
const TimesheetService = require('./synchronize/timesheet');
const SprintService = require('./synchronize/sprint');
const models = require('../../../models');
const moment = require('moment');
const createError = require('http-errors');
const { Project, TaskStatusesAssociation, TaskTypesAssociation, UserEmailAssociation, User } = models;
const request = require('./../request');
const config = require('../../../configs');

const timeSheetsCustomCompare = (a, b) => {
  if (a && b) {
    if (
      a.taskId === b.taskId
      && a.userId === b.userId
      && a.onDate === b.onDate
      && a.statusId === b.statusId
      && a.projectId === b.projectId

    ) {
      return true;
    }
  }
  return false;
};

const summaryTimesheet = (a, b) => {
  a.spentTime += b.spentTime;
  a.comment += ', ' + b.comment;
  return a;
};

const reduceDuplicateTimesheet = (value, valueIndx, arr) => {
  arr.forEach((el, indx) => {
    if (indx !== valueIndx) {
      if (timeSheetsCustomCompare(value, el)) {
        arr[valueIndx] = summaryTimesheet(value, el);
        arr[indx] = null;
      }
    }
  });
};

/**
 * @param data - Данные для синхронизации
 */
exports.jiraSync = async function (headers, data) {
  let resTimesheets, resSprints, resTasks;


  try {

    // Подгрузка ассоциаций
    const [taskStatusesAssociation, taskTypesAssociation, userEmailAssociation] = await Promise.all([
      TaskStatusesAssociation.findAll({}),
      TaskTypesAssociation.findAll({}),
      UserEmailAssociation.findAll({})
    ]);

    // Подготовка проекта
    const [{ projectId }] = data;
    const project = await Project.findOne({
      where: { externalId: projectId }
    });

    if (!project) {
      throw createError(404, 'Project with specified externalId and jiraHostname not found');
    }

    // Подготовка пользователей
    let users = await getJiraProjectUsers(headers, projectId);

    users = users.map(u => u.email);
    let usersAssociation = await UserEmailAssociation.findAll({
      where: { externalUserEmail: { $in: users } }
    });
    usersAssociation = usersAssociation.map(ua => ua.internalUserId);
    users = await User.findAll({
      where: { id: { $in: usersAssociation } }
    });

    /**
     * Модуль со спринтами
     */
    const jiraSprintsObj = data.reduce((acc, task) => {
      if (task.sprint && !acc[task.sprint.id]) {
        acc[task.sprint.id] = {
          name: task.sprint.name,
          authorId: project.authorId
        };
      }

      return acc;
    }, {});

    const sprints = [];
    for (const key in jiraSprintsObj) {
      sprints.push({
        externalId: key,
        name: jiraSprintsObj[key].name,
        authorId: jiraSprintsObj[key].authorId,
        projectId: project.id
      });
    }

    resSprints = await SprintService.synchronizeSprints(sprints, project.id);


    /**
     * Модуль с задачами
     */

    const tasks = data.reduce((acc, task) => {
      const sprint = task.sprint
        ? resSprints.find(sp => sp.externalId.toString() === task.sprint.id.toString())
        : null;

      const statusAssociation = taskStatusesAssociation.find(tsa => {
        return tsa.projectId === project.id && tsa.externalStatusId.toString() === task.status;
      });

      const typeAssociation = taskTypesAssociation.find(tsa => {
        return tsa.projectId === project.id && tsa.externalTaskTypeId.toString() === task.type;
      });

      if (statusAssociation && typeAssociation) {
        acc.push({
          externalId: task.id.toString(),
          name: task.summary,
          factExecutionTime: Math.trunc(task.timeSpent / 3600 * 10000) / 10000,
          sprintId: sprint ? sprint.id : null,
          typeId: typeAssociation.internalTaskTypeId,
          statusId: statusAssociation.internalStatusId,
          authorId: project.authorId,
          projectId: project.id
        });

      }

      return acc;
    }, []);

    resTasks = await TasksService.synchronizeTasks(tasks, project.id);

    /**
     * Модуль с таймшитами
     */

    let timesheets = data.reduce((acc, task) => {

      if (!task.worklogs || task.worklogs.length === 0) {
        return acc;
      }

      task.worklogs.forEach((worklog) => {

        const ueassociation = userEmailAssociation.find(ua => {
          return ua.externalUserEmail === worklog.assignee;
        });
        const user = users.find(u => {
          return u.id === ueassociation.internalUserId;
        });
        // ------------------
        // Поиск спринта
        const sprint = task.sprint
          ? resSprints.find(sp => sp.externalId === task.sprint.id.toString())
          : null;

        // ------------------
        // Поиск задачи
        const tsk = resTasks.find(t => {
          return t.externalId === task.id.toString();
        });

        if (!tsk) {
          return;
        }

        // ------------------
        const newWorklog = {
          taskId: tsk.id,
          sprintId: sprint ? sprint.id : null,
          userId: user.id,
          onDate: moment(new Date(worklog.onDate)).format('YYYY-MM-DD'), // поправить
          spentTime: Math.trunc(worklog.timeSpent / 3600 * 10000) / 10000,
          externalId: worklog.id,
          comment: worklog.comment,
          typeId: 1,
          statusId: 1,
          projectId: project.id,
          isBillable: true
        };

        acc.push(newWorklog);

      });

      return acc;
    }, []);

    timesheets.forEach((el, indx) => {
      reduceDuplicateTimesheet(el, indx, timesheets);
    });

    timesheets = timesheets.filter(el => el);

    resTimesheets = await TimesheetService.synchronizeTimesheets(timesheets, project.id);


    return { resSprints, resTasks, resTimesheets };

  } catch (e) {
    throw e;
  }

};

// Пока не используется
exports.clearProjectAssociate = async function (simTrackProjectId) {
  const simTrackProject = await Project.findByPrimary(simTrackProjectId);
  if (!simTrackProjectId) {
    throw createError(404, 'Project not found');
  }
  await simTrackProject.update({ externalId: null, jira_hostname: null, jiraProjectName: null });
};

exports.setAssociateWithJiraProject = async function (simTrackProjectId, jiraProjectId, jiraHostName, jiraProjectName, jiraToken) {
  const simTrackProject = await Project.findByPrimary(simTrackProjectId);
  if (!simTrackProject) {
    throw createError(404, 'Project not found');
  }
  await simTrackProject.update({
    externalId: jiraProjectId,
    jiraHostname: jiraHostName,
    jiraProjectName: jiraProjectName,
    jiraToken: jiraToken
  });
  return jiraProjectId;
};

/**
 * @param {string} id
 * @param {string} authorI
 * @deprecated
 */
exports.createProject = async function (headers, id, authorId, prefix) {
  const { data: jiraProject } = await request.get(`${config.ttiUrl}/project/${id}`, {
    headers
  });
  const jiraHostname = await getJiraHostname(headers);
  const users = await getJiraProjectUsers(headers, id);
  let project;

  project = await Project.find({ where: { externalId: jiraProject.id } });
  if (project) {
    project = {
      ...project.dataValues,
      ...{ issue_types: jiraProject.issue_types },
      ...{ status_types: jiraProject.status_type },
      ...{ users }
    };
  } else {
    project = await Project.create({
      name: jiraProject.name,
      createdBySystemUser: true,
      externalId: jiraProject.id,
      authorId,
      prefix,
      jiraHostname: jiraHostname.server
    });
    project = {
      ...project.dataValues,
      ...{ issue_types: jiraProject.issue_types },
      ...{ status_types: jiraProject.status_type },
      ...{ users }
    };
  }

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
    delete it.id;
    return it;
  });

  const sa = statusesAssociation.map(s => {
    s.projectId = projectId;
    delete s.id;
    return s;
  });

  const ua = userEmailAssociation.map(u => {
    u.projectId = projectId;
    delete u.id;
    return u;
  });

  // ------
  const [createdTaskTypes, createdTaskStatuses, createdUserEmail] = await Promise.all([
    TaskTypesAssociation.findAll({ where: { projectId } }),
    TaskStatusesAssociation.findAll({ where: { projectId } }),
    UserEmailAssociation.findAll({ where: { projectId } })
  ]);

  if (createdTaskTypes.length !== 0) {
    await TaskTypesAssociation.destroy({ where: { projectId } });
  }
  if (createdTaskStatuses.length !== 0) {
    await TaskStatusesAssociation.destroy({ where: { projectId } });
  }
  if (createdUserEmail.length !== 0) {
    await UserEmailAssociation.destroy({ where: { projectId } });
  }

  // ------

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
/**
 *  @param {string} server - адрес сервера джиры
 *  @param {string} email - адрес сервера джиры
 */
exports.jiraAuth = async function (username, password, server, email) {
  return request.post(`${config.ttiUrl}/auth`, {
    username,
    password,
    server,
    email
  });
};

exports.getJiraProjects = async function (headers) {
  try {
    return request.get(`${config.ttiUrl}/projects`, { headers });
  } catch (e) {
    throw e;
  }
};

exports.getJiraProjectById = async function (jiraProjectId, headers) {
  return await request.get(`${config.ttiUrl}/project/${jiraProjectId}`, {
    headers
  });
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
  const { data: users } = await request.get(`${config.ttiUrl}/project/${projectId}/users`, {
    headers
  });
  return users;
}

async function getJiraHostname (headers) {
  const { data: server } = await request.get(`${config.ttiUrl}/jira-client`, {
    headers
  });
  return server;
}

exports.createBatch = async function (headers, pid) {
  const res = await request.post(
    `${config.ttiUrl}/batch`,
    {
      pid
    },
    { headers }
  );
  return res;
};

exports.getProjectAssociations = async function (projectId) {
  try {
    const [issueTypesAssociation, statusesAssociation, userAssociation] = await Promise.all([
      TaskTypesAssociation.findAll({ where: { projectId } }),
      TaskStatusesAssociation.findAll({ where: { projectId } }),
      UserEmailAssociation.findAll({ where: { projectId } })
    ]);

    const userIds = userAssociation.map(e => e.internalUserId);
    const users = await User.findAll({ where: { id: { $in: userIds } } });
    const userEmailAssociation = userAssociation.map(ua => {
      const user = users.find(u => ua.internalUserId === u.id);
      return {
        ...ua.dataValues,
        ...{ fullNameRu: user.fullNameRu }
      };
    });
    return {
      issueTypesAssociation,
      statusesAssociation,
      userEmailAssociation
    };
  } catch (e) {
    throw e;
  }
};

exports.getJiraProjectUsers = getJiraProjectUsers;
