const http = require('../http');
const createError = require('http-errors');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Project } = require('../../models');
const { createMasterCommit } = require('./commits');
const axios = require('axios');

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

  if (project.gitlabProjectIds.includes(gitlabProject.id)) {
    throw createError(400, 'GITLAB_PROJECT_ALREADY_LINKED');
  }

  if (project.gitlabProjectIds instanceof Array) {
    project.gitlabProjectIds.push(gitlabProject.id);
  } else {
    project.gitlabProjectIds = [gitlabProject.id];
  }

  await project.set('gitlabProjectIds', project.gitlabProjectIds);
  await project.save();
  return gitlabProject;
};

const createProject = async function (name, namespace_id, projectId) {
  const postData = {
    merge_requests_enabled: true,
    name,
    namespace_id
  };
  let gitlabProject;
  try {
    gitlabProject = await axios.post(prettyUrl(`${host}/api/v4/projects`), postData, {headers})
      .then(reply => reply.data);
    await createMasterCommit(gitlabProject.id);
  } catch (e) {
    throw e.response
      ? createError(e.response.status || 500, 'GITLAB_ERROR')
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

  return gitlabProject;
};

/**
 * GET /projects/:id/members
 * @param {number} projectId
 */
const getProjectMembers = async function (projectId) {
  const gitlabProjectMembers = await axios.get(prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members`), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, 'GITLAB_ERROR')
        : e;
    });
  return gitlabProjectMembers;
};

/**
 * POST /projects/:id/members
 * @param {number} projectId
 * @param {object} properties
 * @param {number} properties.user_id
 * @param {number} properties.project_id
 * @param {number} properties.access_level
 * @param {number} properties.access_level
 * @param {number} properties.invite_email
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
      ? createError(e.response.status || 500, 'GITLAB_ERROR')
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
 */
const editProjectMember = async function (projectId, memberId, properties) {
  let gitlabProjectMember;
  try {
    gitlabProjectMember = axios.put(
      prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`),
      { ...properties, user_id: memberId }, { headers }
    ).then(reply => reply.data);
  } catch (e) {
    throw e.response
      ? createError(e.response.status || 500, 'GITLAB_ERROR')
      : e;
  }
  return gitlabProjectMember;
};

/**
 * DELETE /projects/:id/members/:user_id
 * @param {number} projectId
 * @param {number} memberId
 */
const removeProjectMember = async function (projectId, memberId) {
  let gitlabProjectMember;
  try {
    gitlabProjectMember = axios.delete(
      prettyUrl(`${host}/api/v4/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`), { headers }
    ).then(reply => reply.data);
  } catch (e) {
    throw e.response
      ? createError(e.response.status || 500, 'GITLAB_ERROR')
      : e;
  }
  return gitlabProjectMember;
};

const getNamespacesList = () =>
  http.get({ host, path: '/api/v4/namespaces', headers });

module.exports = {
  getProject,
  addProjectByPath,
  getProjects,
  getProjectsOrErrors,
  createProject,
  getNamespacesList,
  getProjectMembers,
  addProjectMember,
  editProjectMember,
  removeProjectMember
};
