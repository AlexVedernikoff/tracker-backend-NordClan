const http = require('../http');
const config = require('../../configs').gitLab;
const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };

const createMasterCommit = async function (repoId) {
  const branch = 'master';
  const commit_message = 'add readme';
  const actions = [
    {
      action: 'create',
      file_path: `${__dirname}/server/services/gitLab/README.md`
    }
  ];
  const postData = {
    branch,
    commit_message,
    actions
  };

  return http.post({ host, path: `/api/v4/projects/${repoId}/repository/commits`, headers}, postData);

};

module.exports = {
  createMasterCommit
};

