const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const createError = require('http-errors');
const { Project } = require('../../models');

const getProject = id => http.get({ host, path: `/api/v4/projects/${id}`, headers });
const getProjects = async function (ids) {
  const projects = [];
  await Promise.all(ids.map(id => {
    return getProject(id)
      .then(gitlabResponse => projects.push(gitlabResponse))
      .catch(error => projects.push({id, error: error.message}));
  }));
  return projects;
};

const addProjectByPath = async function (projectId, path) {
  try {
    const gitlabProject = await http.get({ host, path: `/api/v4/projects/${encodeURIComponent(path)}`, headers });
    const project = await Project.find({where: {id: projectId}});
    if (project.gitlabProjectIds instanceof Array) {
      project.gitlabProjectIds.push(gitlabProject.id);
    } else {
      project.gitlabProjectIds = [gitlabProject.id];
    }
    await project.save();
  } catch (e) {
    throw createError(400, 'Can not add Gitlab project');
  }
};

module.exports = {
  getProject,
  getProjects,
  addProjectByPath
};

