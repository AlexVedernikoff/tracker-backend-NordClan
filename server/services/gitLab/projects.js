const axios = require('axios');
const http = require('../http');
const createError = require('http-errors');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { sequelize, User, Project, ProjectUsers, ProjectUsersRoles, ProjectRolesDictionary, GitlabUserRoles } = require('../../models');
const { createMasterCommit } = require('./commits');
const { findOrCreateUser, findOrCreateGroup } = require('./users');

const prettyUrl = (url) => (/^https?:\/\//).test(url) ? url : 'http://' + url;
const getProject = id =>
  http.get({ host, path: `/api/v4/projects/${id}`, headers });

const getProjects = async function (ids) {
  const projects = [];
  await Promise.all(
    ids.map(id => {
      return getProject(id)
        .then(gitlabResponse => projects.push(gitlabResponse))
        .catch(error => projects.push({ id, error: error.message }));
    })
  );
  return projects;
};

const getProjectsOrErrors = ids =>
  Promise.all(ids.map(id =>
    axios.get(prettyUrl(`${host}/api/v4/projects/${id}`), {headers})
      .then(reply => reply.data)
      .catch(err => ({
        id,
        status: err.response && err.response.status,
        error: err.response ? err.response.data.message : err.message
      }))
  ));

const addProjectByPath = async function (projectId, path) {
  const gitlabProject = await axios.get(prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(path)}`), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw createError(
        e.response.status || 500,
        e.response.data.message === '404 Project Not Found'
          ? 'GITLAB_ERROR_PROJECT_NOT_FOUND'
          : e.response.data.message
      );
    });
  const project = await Project.find({ where: { id: projectId } });

  if (project.gitlabProjectIds && project.gitlabProjectIds.includes(gitlabProject.id)) {
    throw createError(400, 'GITLAB_PROJECT_ALREADY_LINKED');
  }

  if (Array.isArray(project.gitlabProjectIds)) {
    project.gitlabProjectIds.push(gitlabProject.id);
  } else {
    project.gitlabProjectIds = [gitlabProject.id];
  }

  await project.set('gitlabProjectIds', project.gitlabProjectIds);
  await project.save();
  let transaction;
  let notProcessedGitlabUsers = [];
  try {
    transaction = await sequelize.transaction();
    notProcessedGitlabUsers = await addAllProjectUsersToGitlab(projectId, gitlabProject.id, transaction);
    await transaction.commit();
  } catch (e) {
    transaction && await transaction.rollback();
    throw e.response
      ? createError(e.response.status || 500, e.response.data.message)
      : e;
  }

  return { gitlabProject, notProcessedGitlabUsers };
};

const createProject = async function (name, namespace_id, projectId) {
  const postData = await getGroup(name, namespace_id);
  let gitlabProject;
  let transaction;
  let notProcessedGitlabUsers = [];
  try {
    gitlabProject = await axios.post(prettyUrl(`${host}/api/v4/projects`), postData, {headers})
      .then(reply => reply.data);
    await createMasterCommit(gitlabProject.id);
    transaction = await sequelize.transaction();
    notProcessedGitlabUsers = await addAllProjectUsersToGitlab(projectId, gitlabProject.id, transaction);
    await transaction.commit();
  } catch (e) {
    transaction && await transaction.rollback();
    throw e.response
      ? createError(e.response.status || 500, e.response.data.message)
      : e;
  }

  const project = await Project.find({ where: { id: projectId } });
  if (project.gitlabProjectIds instanceof Array) {
    project.gitlabProjectIds.push(gitlabProject.id);
  } else {
    project.gitlabProjectIds = [gitlabProject.id];
  }
  await project.set('gitlabProjectIds', project.gitlabProjectIds);
  await project.save();

  return { gitlabProject, notProcessedGitlabUsers };
};

/**
 * GET /projects/:id/members
 * @param {number} projectId
 */
const getProjectMembers = async function (projectId) {
  return await axios.get(prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members`), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
};

/**
 * GET /projects/:id/members/:user_id
 * @param {number} projectId
 * @param {number} memberId
 */
const getProjectMember = async function (projectId, memberId) {
  return await axios.get(prettyUrl(
    `${host}/api/v4/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`
  ), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
};

/**
 * POST /projects/:id/members
 * @param {number} projectId
 * @param {number} memberId
 * @param {object} properties
 * @param {number} properties.project_id
 * @param {number} properties.access_level
 * @param {string} properties.expires_at
 */
const addProjectMember = async function (projectId, memberId, properties) {
  let gitlabProjectMember;
  try {
    gitlabProjectMember = axios.post(
      prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members`),
      { ...properties, user_id: memberId }, { headers }
    ).then(reply =>
      reply.data
    );
  } catch (e) {
    throw e.response
      ? createError(e.response.status || 500, e.response.data.message)
      : e;
  }
  return gitlabProjectMember;
};

/**
 * PUT /projects/:id/members/:user_id
 * @param {number} projectId
 * @param {number} memberId
 * @param {object} properties
 * @param {number} properties.project_id
 * @param {number} properties.access_level
 * @param {string} properties.expires_at
 */
const editProjectMember = async function (projectId, memberId, properties) {
  return await axios.put(
    prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`),
    { ...properties, user_id: memberId }, { headers }
  ).then(reply => reply.data).catch(e => {
    throw e.response
      ? createError(e.response.status || 500, e.response.data.message)
      : e;
  });
};

/**
 * DELETE /projects/:id/members/:user_id
 * @param {number} projectId
 * @param {number} memberId
 */
const removeProjectMember = async function (projectId, memberId) {
  return await axios.delete(
    prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`), { headers }
  ).then(reply => {
    return reply.data;
  })
    .catch(e => {});
};

/**
 * Всем участникам проекта выдаются соответствующие доступы к репозиторию
 * @param {number} projectId
 * @param {number} gitlabProjectId
 * @param {object} transaction
 * @returns {object[]}
 */
async function addAllProjectUsersToGitlab (projectId, gitlabProjectId, transaction) {
  const projectUsers = await ProjectUsers.findAll({
    where: { projectId, deletedAt: null },
    include: [
      {
        as: 'roles',
        model: ProjectUsersRoles
      },
      {
        as: 'user',
        model: User,
        where: {
          active: 1,
          globalRole: {
            $not: User.EXTERNAL_USER_ROLE
          }
        },
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'login']
      }
    ],
    defaults: { projectId },
    transaction
  });
  const notProcessedGitlabUsers = await Promise.all(
    projectUsers.map((projectUser) => {
      const roles = GitlabUserRoles.fromProjectUserRole(
        projectUser.roles.map(({ projectRoleId }) => projectRoleId),
        [gitlabProjectId]
      );
      return processGitlabRoles(roles, projectUser, transaction);
    })
  );

  return notProcessedGitlabUsers;
}

/**
 * У  всех участников проекта отнимаются доступы к репозиторию
 * @param {number} projectId
 * @param {number} gitlabProjectId
 */
async function removeAllProjectUsersFromGitlab (projectId, gitlabProjectId) {
  const projectUsers = await ProjectUsers.findAll({
    where: { projectId, deletedAt: null },
    include: [
      {
        as: 'roles',
        model: ProjectUsersRoles
      },
      {
        as: 'user',
        model: User,
        where: {
          active: 1,
          globalRole: {
            $not: User.EXTERNAL_USER_ROLE
          }
        },
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'firstNameEn', 'lastNameEn', 'login', 'gitlabUserId']
      }
    ],
    defaults: { projectId }
  });
  await Promise.all(
    projectUsers
      .filter(projectUser => projectUser.user.gitlabUserId)
      .map(projectUser => removeProjectMember(gitlabProjectId, projectUser.user.gitlabUserId))
  );
}

/**
 * Обработка переданных ролей для гитлаба
 * @param {array} gitlabRoles
 * @param {object} projectUser
 * @param {object} transaction
 * @returns {{user: object, data: object, error: string}[]}
 */
async function processGitlabRoles (gitlabRoles, projectUser, transaction) {
  const user = await User.findOne({
    where: { id: projectUser.userId },
    transaction
  });
  let gitlabUserId = user.gitlabUserId;
  const notProcessedGitlabUsers = [];
  //Находим или создаем пользователя в гитлабе и сохраняем ссылку в базе
  if (!gitlabUserId) {
    const gitlabUser = await findOrCreateUser(user);
    gitlabUserId = gitlabUser.id;
    await User.update({ gitlabUserId: gitlabUser.id }, {
      where: { id: projectUser.userId },
      transaction
    });
  }
  const gitlabProjectsIds = gitlabRoles.reduce((acc, { gitlabProjectId }) => {
    if (acc.indexOf(gitlabProjectId) === -1) {
      acc.push(gitlabProjectId);
    }
    return acc;
  }, []);
  const userGitlabRoles = await GitlabUserRoles.findAll({
    where: {
      $and: {
        projectUserId: projectUser.id,
        gitlabProjectId: {
          $in: gitlabProjectsIds
        }
      }
    },
    attributes: ['id', 'accessLevel', 'expiresAt'],
    transaction
  });
  const newGitlabRoles = [];
  const updatedGitlabRoles = [];
  const removedGitlabRoles = userGitlabRoles.slice(0);

  gitlabRoles.forEach(({ accessLevel, expiresAt, gitlabProjectId }) => {
    const existedRoleIndex = removedGitlabRoles.findIndex(role => role.get('projectId') === gitlabProjectId);
    const existedRole = removedGitlabRoles[existedRoleIndex];
    if (existedRole && existedRole.get('accessLevel') === accessLevel && existedRole.get('expiresAt') === expiresAt) {
      updatedGitlabRoles.push({ id: existedRole.id, accessLevel, expiresAt, gitlabProjectId });
      removedGitlabRoles.splice(existedRoleIndex);
    } else if (!existedRole) {
      newGitlabRoles.push({ accessLevel, expiresAt, gitlabProjectId });
    }
  });

  if (removedGitlabRoles.length) {
    const successRemoved = [];
    await Promise.all(
      removedGitlabRoles.map(({ id, gitlabProjectId }) => {
        return removeProjectMember(gitlabProjectId, gitlabUserId)
          .then(gitlabResponse => successRemoved.push(id))
          .catch(error => notProcessedGitlabUsers.push({ user, data: { delete: true, gitlabProjectId }, error: error.response.data.error }));
      })
    );
    GitlabUserRoles.destroy({
      where: {
        id: { $in: successRemoved }
      }
    }, { transaction });
  }

  if (newGitlabRoles.length) {
    const successAdded = [];
    await Promise.all(
      newGitlabRoles.map(({ accessLevel, expiresAt, gitlabProjectId }) => {
        const successAddedData = { accessLevel, expiresAt, gitlabProjectId, projectUserId: projectUser.id };
        return addProjectMember(gitlabProjectId, gitlabUserId, {
          access_level: accessLevel,
          expires_at: expiresAt,
          invite_email: user.emailPrimary
        })
          .then(gitlabReponse => {
            successAdded.push(successAddedData);
          })
          .catch(async error => {
            //если пользователь уже есть в проекте гитлаба
            if (error.response.status === 409) {
              successAdded.push(successAddedData);
              await editProjectMember(gitlabProjectId, gitlabUserId, { access_level: accessLevel, expires_at: expiresAt });
            } else {
              notProcessedGitlabUsers.push({ user, data: { accessLevel, expiresAt, gitlabProjectId }, error: error.response.data.error });
            }
          });
      })
    );
    await GitlabUserRoles.bulkCreate(successAdded, { transaction });
  }

  if (updatedGitlabRoles.length) {
    const successUpdated = [];
    await Promise.all(
      updatedGitlabRoles.map(({ id, accessLevel, expiresAt, gitlabProjectId }) => {
        return editProjectMember(gitlabProjectId, gitlabUserId, { access_level: accessLevel, expires_at: expiresAt })
          .then(gitlabResponse => successUpdated.push({ id, accessLevel, expiresAt, gitlabProjectId, projectUserId: projectUser.id }))
          .catch(error => notProcessedGitlabUsers.push({ user, data: { accessLevel, expiresAt, gitlabProjectId }, error: error.response.data.error }));
      })
    );
    await Promise.all(
      successUpdated.map((member) => {
        return GitlabUserRoles.update(member, {
          where: { id: member.id }
        }, { transaction });
      })
    );
  }
  return notProcessedGitlabUsers;
}

const getNamespacesList = () =>
  http.get({ host, path: '/api/v4/groups', headers });


async function getGroup (name, namespace_id) {
  if (typeof (namespace_id) === 'string') {
    const group = await findOrCreateGroup({name: namespace_id});
    return {
      merge_requests_enabled: true,
      name,
      namespace_id: group.id
    };
  } else {
    return {
      merge_requests_enabled: true,
      name,
      namespace_id
    };
  }
}

module.exports = {
  getProject,
  addProjectByPath,
  getProjects,
  getProjectsOrErrors,
  createProject,
  getNamespacesList,
  getProjectMembers,
  getProjectMember,
  addProjectMember,
  editProjectMember,
  removeProjectMember,
  processGitlabRoles,
  removeAllProjectUsersFromGitlab
};
