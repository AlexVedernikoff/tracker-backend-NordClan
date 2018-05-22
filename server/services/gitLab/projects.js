const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const baseUrl = config.host;
const headers = { 'PRIVATE-TOKEN': token };

const getProject = id => http.get(`${baseUrl}/api/v4/projects/${id}`, { headers });
const getProjects = async function (ids) {
  const projects = [];
  await Promise.all(ids.map(id => {
    return getProject(id)
      .then(gitlabResponse => projects.push(gitlabResponse.data))
      .catch(() => projects.push(null));
  }));
  return projects;
};

module.exports = {
  getProject,
  getProjects
};

