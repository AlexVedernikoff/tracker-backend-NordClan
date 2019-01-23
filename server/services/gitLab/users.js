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
  return await axios.get(prettyUrl(`${host}/api/v4/users/${encodeURIComponent(userId)}`), { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

/**
 * GET /users
 */
async function getUsers () {
  return await axios.get(prettyUrl(`${host}/api/v4/users/`), { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

/**
 * GET /users?search=:email
 * @param {object} user
 */
async function findUser (user) {
  return await axios.get(prettyUrl(`${host}/api/v4/users?search=${encodeURIComponent(user.emailPrimary)}`), { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

/**
 * POST /users
 * https://docs.gitlab.com/ee/api/users.html#user-creation
 * @param {object} user
 */
async function createUser ({ emailPrimary: email, fullNameRu: name, login: username }) {
  return await axios.post(prettyUrl(`${host}/api/v4/users`), { email, username, name, reset_password: true }, { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

async function findOrCreateUser (user) {
  const users = await findUser(user);
  const gitlabUser = users[0];
  return gitlabUser || await createUser(user);
}

module.exports = {
  getUsers,
  getUser,
  findOrCreateUser
};

