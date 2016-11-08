'use strict';

const request = require('request-promise');
const co = require('co');

const config = require('../configs');
const HttpError = require('./HttpError');
const Project = require('./Project');
const User = require('./User');
const Task = require('./Task');

class PS {
  constructor(options) {
    this.options = options;
  }

  static request(route, params = {}) {
    let { host, port, path, username, password } = config.ps;
    params.url = `http://${host}:${port}${path}${route}`;
    params.headers = {
      Authorization: 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    };
    params.json = true;

    return request(params);
  }

  static *getUser(username) {
    let users = yield this.request(`users/${username}`);
    return users[0];
  }

  static *syncTasks(username) {
    let psTasks = yield this.request(`tasks/user/${username}`);

    let projectIds = [];
    let userLogins = [username];

    psTasks.map(({ idProj }) => {
      if (projectIds.indexOf(idProj) < 0) projectIds.push(idProj);
    });

    psTasks.map(({ creator: { login } }) => {
      if (login !== username && userLogins.indexOf(login) < 0) userLogins.push(login);
    });

    let projects = yield Project.findAll({ ps_id: { '$in': projectIds } });
    projectIds = projectIds.filter(id => !projects.find(p => p.ps_id == id));

    for (let i = 0; i < projectIds.length; i++) {
      let psId = projectIds[i];
      let psP = yield this.request('projects', { qs: { projectIds: psId } });
      psP = psP[0];
      if (psP) {
        let project = new Project();
        project.setData({
          name: psP.name,
          status: psP.status,
          start_date: psP.startDate,
          ps_id: psId //-psId-
        });
        project = yield project.save();
        projects.push(project);
      }
    }

    let users = yield User.findAll({ username: { '$in': userLogins } });
    userLogins = userLogins.filter(login => !users.find(u => u.username == login));

    for (let i = 0; i < userLogins.length; i++) {
      let username = userLogins[i];
      let psUser = yield this.request(`users/${username}`);
      psUser = psUser[0];
      if (psUser) {
        let user = new User();
        user.setData({
          username,
          firstname_ru: psUser.firstNameRu,
          lastname_ru: psUser.lastNameRu,
          firstname_en: psUser.firstNameEn,
          lastname_en: psUser.lastNameEn,
          email: psUser.emailPrimary,
          mobile: psUser.mobile,
          skype: psUser.skype,
          photo: psUser.photo,
          birthday: psUser.birthDate,
          ps_id: psUser.id,
        });
        user = yield user.save();
        users.push(user);
      }
    }

    for (let i = 0; i < psTasks.length; i++) {
      let psTask = psTasks[i];
      let task = new Task();
      task.setData({
        name: psTask.name,
        status: psTask.status,
        priority: psTask.priority,
        type: psTask.type,
        planed_time: psTask.plannedTime,
        fact_time: psTask.currentTime,
        owner: users.find(u => u.ps_id == psTask.owner.id),
        author: users.find(u => u.ps_id == psTask.creator.id),
        project: projects.find(p => p.psId == psTask.idProj),
        ps_id: psTask.id,
      });

      yield task.save();
    }
  }
}

module.exports = PS;
