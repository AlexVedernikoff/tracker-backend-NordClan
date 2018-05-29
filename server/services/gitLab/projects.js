const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };

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

module.exports = {
  getProject,
  getProjects
};

