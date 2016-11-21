'use strict';

const md5 = require('md5');

const HttpError = require('./HttpError');
const Sequelize = require('sequelize');
const sequelize = require('../orm');
const ProjectStatus = require('./ProjectStatus');

const ProjectModel = sequelize.define('projects', {
    name: { type: Sequelize.STRING, allowNull: false },
    start_date: Sequelize.DATE,
    ps_id: Sequelize.STRING,
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    }
  });

ProjectModel.belongsTo(ProjectStatus.model, { foreignKey: 'status_id' });

class Project {
  constructor() {}

  static get model() {
    return ProjectModel;
  }

  static find(params) {
    let eagerLoad = [];
    let populate = params.populate;
    delete params.populate;

    populate = populate ? populate.split(',') : [];
    let popObj = {
      projectStatus: { model: ProjectStatus.model }
    };

    populate.map(p => popObj[p] ? eagerLoad.push(popObj[p]) : false);

    let find = ProjectModel.findOne({ where: params, include: eagerLoad });

    return find.then(project => project ? (new Project()).setData(project.toJSON(), true) : project);
  }

  static findAll(params) {
    let eagerLoad = [];
    let populate = params.populate;
    delete params.populate;

    populate = populate ? populate.split(',') : [];
    let popObj = {
      projectStatus: { model: ProjectStatus.model }
    };

    populate.map(p => popObj[p] ? eagerLoad.push(popObj[p]) : false);

    let find = ProjectModel.findAll({ where: params, include: eagerLoad });

    return find.then(projects => projects ? projects.map(p => (new Project()).setData(p.toJSON(), true)) : []);
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
    let project = ProjectModel.build(this);
    if (this.id) project.isNewRecord = false;
    return new Promise((resolve, reject) => {
      project.save()
      .then(function() {
        resolve(Project.find({ id: project.id }));
      })
      .catch(err => reject(new HttpError(400, (err.errors ? err.errors[Object.keys(err.errors)[0]] : err))));
    });

  }
}

module.exports = Project;
