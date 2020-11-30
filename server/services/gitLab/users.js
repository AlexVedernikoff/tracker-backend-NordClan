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
  console.log(`INFO: gitlabService: findUser: ${user.emailPrimary}`);

  return await axios.get(prettyUrl(`${host}/api/v4/users?search=${encodeURIComponent(user.emailPrimary)}`), { headers })
    .then(reply => reply.data)
    .catch(e => {
      console.error(`ERROR: gitlabService: findUser: ${e.response.status || 500}\n${JSON.stringify(e.response.data, undefined, 4)}`);

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
  console.log(`INFO: gitlabService: createUser: ${username}`);

  return await axios.post(prettyUrl(`${host}/api/v4/users`), { email, username, name, reset_password: true }, { headers })
    .then(reply => reply.data)
    .catch(e => {
      console.error(`ERROR: gitlabService: createUser: ${e.response.status || 500}\n${JSON.stringify(e.response.data, undefined, 4)}`);

      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

async function findOrCreateUser (user) {
  console.log(`INFO: gitlabService: findOrCreateUser: ${JSON.stringify({ user }, undefined, 4)}`);

  const users = await findUser(user);
  const gitlabUser = users[0];
  return gitlabUser || await createUser(user);
}

async function findGroup (group) {
  return await axios.get(prettyUrl(`${host}/api/v4/groups?search=${encodeURIComponent(group.name)}`), { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

/**
 * POST /groups
 * https://docs.gitlab.com/ee/api/groups.html
 * @param {object} group
 */
async function createGroup (group) {
  return await axios.post(prettyUrl(`${host}/api/v4/groups`), { name: group.name, path: group.name }, { headers })
    .then(reply => reply.data)
    .catch(e => {
      throw e.response
        ? createError(e.response.status || 500, e.response.data.message)
        : e;
    });
}

async function findOrCreateGroup (group) {
  const grops = await findGroup(group);
  const gitlabGroup = grops[0];
  return gitlabGroup || await createGroup(group);
}

module.exports = {
  getUsers,
  getUser,
  findOrCreateUser,
  findOrCreateGroup
};
