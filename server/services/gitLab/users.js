const config = require('../../configs').gitLab;
const axios = require('axios');
const createError = require('http-errors');

const token = config.token;
const host = config.host;
const headers = { 'PRIVATE-TOKEN': token };
const prettyUrl = (url) => (/^https?:\/\//).test(url) ? url : 'http://' + url;

/**
 * GET /users/:id/
 * @param {number} userId
 */
async function getUser (userId) {
  return await axios.get(prettyUrl(`${host}/api/v4/users/${encodeURIComponent(userId)}`), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, 'GITLAB_ERROR')
        : e;
    });
}

/**
 * GET /users
 */
async function getUsers () {
  return await axios.get(prettyUrl(`${host}/api/v4/users/`), {headers})
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, 'GITLAB_ERROR')
        : e;
    });
}

module.exports = {
  getUsers,
  getUser
};

