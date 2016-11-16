'use strict';

const request = require('request-promise');
const co = require('co');

const config = require('../configs');
const HttpError = require('./HttpError');
const Project = require('./Project');
const User = require('./User');
const Task = require('./Task');
const ProjectStatus = require('./ProjectStatus');
const TaskStatus = require('./TaskStatus');
const TaskType = require('./TaskType');

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
    try {
      var psTasks = yield this.request(`tasks/user/${username}`);
    } catch (e) {
      throw new HttpError(404, 'User Not Found');
    }

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
        let status = yield ProjectStatus.find({ name: psP.status });
        let dateParts = psP.startDate.split('.');
        let project = new Project();
        project.setData({
          name: psP.name,
          status_id: status.id,
          start_date: new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]),
          ps_id: psId
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
        let dateParts = psUser.birthDate.split('.');
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
          birthday: new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]),
          ps_id: psUser.id,
        });
        user = yield user.save();
        users.push(user);
      }
    }

    for (let i = 0; i < psTasks.length; i++) {
      let psTask = psTasks[i];
      let status = yield TaskStatus.find({ ps_name: psTask.status });
      let task = new Task();
      task.setData({
        name: psTask.name,
        status_id: status.id, //может быть null т.к не известны все статусы в системе PS
        priority_id: psTask.priority,
        type: psTask.type, //-- хэш приходит вместо значения
        planned_time: psTask.plannedTime,
        fact_time: psTask.currentTime,
        owner_id: users.find(u => u.ps_id == psTask.owner.id).id,
        author_id: users.find(u => u.ps_id == psTask.creator.id).id,
        project_id: projects.find(p => p.ps_id == psTask.idProj).id,
        ps_id: psTask.id,
      });

      yield task.save();
    }
  }
}

module.exports = PS;
