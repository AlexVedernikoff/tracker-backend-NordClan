'use strict';

const md5 = require('md5');

const HttpError = require('./HttpError');

const sequelize = require('../orm');
const Sequelize = require('sequelize');
const ProjectStatusModel = require('./pgProjectStatus');

const ProjectModel = sequelize.define('projects', {
    name: { type: Sequelize.STRING, allowNull: false },
    start_date: Sequelize.DATE,
    ps_id: Sequelize.INTEGER
  });

ProjectModel.belongsTo(ProjectStatusModel, { foreignKey: 'status_id' });

class Project {
  constructor() {}

  static get model() {
    return ProjectModel;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = ProjectModel.findOne({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, doc) => err ? reject(err) : resolve(doc)))
      .then(project => project ? (new Project()).setData(project, true) : project);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = ProjectModel.findAll({ where: params });
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, docs) => err ? reject(err) : resolve(docs)))
      .then(projects => projects ? projects.map(p => (new Project()).setData(p, true)) : []);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this.id = data.id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }

  save() {
    let project = new ProjectModel(this);
    if (this.id) task.isNewRecord = false;
    return new Promise((resolve, reject) =>
      project.save((err, doc) => err ? reject(err) : resolve(Project.find({ id: project.id })))
    ).catch(err => Promise.reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
  }
}

module.exports = Project;
