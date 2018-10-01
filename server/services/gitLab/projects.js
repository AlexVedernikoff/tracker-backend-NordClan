const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const { Project } = require('../../models');
const { createMasterCommit } = require('./commits');

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

const addProjectByPath = async function (projectId, path) {
  const gitlabProject = await http.get({
    host,
    path: `/api/v4/projects/${encodeURIComponent(path)}`,
    headers
  });
  const project = await Project.find({ where: { id: projectId } });

  if (project.gitlabProjectIds.includes(gitlabProject.id)) {
    throw new Error(400, 'Gitlab identifier is invalid');
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
    gitlabProject = await http.post(
      { host, path: '/api/v4/projects', headers },
      postData
    );
    await createMasterCommit(gitlabProject.id);
  } catch (e) {
    throw new Error(404, 'Gitlab error');
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
  createProject,
  getNamespacesList
};
