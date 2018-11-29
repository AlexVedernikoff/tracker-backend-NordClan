const http = require('../http');
const createError = require('http-errors');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Project } = require('../../models');
const { createMasterCommit } = require('./commits');
const axios = require('axios');

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

const prettyUrl = (url) => (/^https?:\/\//).test(url) ? url : 'http://' + url;
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
  const gitlabProject = await http.get({
    host,
    path: `/api/v4/projects/${encodeURIComponent(path)}`,
    headers
  });
  const project = await Project.find({ where: { id: projectId } });

  if (project.gitlabProjectIds.includes(gitlabProject.id)) {
    throw createError(400, 'Gitlab identifier is invalid');
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
      ? createError(e.response.status || 500, 'Gitlab error: maybe the project already exists')
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

const getNamespacesList = () =>
  http.get({ host, path: '/api/v4/namespaces', headers });

module.exports = {
  getProject,
  addProjectByPath,
  getProjects,
  getProjectsOrErrors,
  createProject,
  getNamespacesList
};
