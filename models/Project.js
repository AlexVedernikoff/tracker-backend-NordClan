'use strict';

const md5 = require('md5');
const mongoose = require('mongoose');

const HttpError = require('./HttpError');

const ProjectSchema = new mongoose.Schema({
  name: String,
  status: String,
  startDate: String,
  psId: String,
}, { versionKey: false, timestamps: true });

const ProjectModel = mongoose.model('Project', ProjectSchema);

class Project {
  constructor(application) {
    let name = 'Project';

    return this;
  }

  static find(params) {
    let populate = params.populate;
    delete params.populate;

    let find = ProjectModel.findOne(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, doc) => err ? reject(err) : resolve(doc)))
      .then(project => project ? (new Project()).setData(project, true) : project);
  }

  static findAll(params) {
    let populate = params.populate;
    delete params.populate;

    let find = ProjectModel.find(params);
    if (populate) find.populate(populate);

    return new Promise((resolve, reject) => find.exec(params, (err, docs) => err ? reject(err) : resolve(docs)))
      .then(projects => projects ? projects.map(p => (new Project()).setData(p, true)) : []);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this._id = data._id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }

  save() {
    let project = new ProjectModel(this);
    return new Promise((resolve, reject) =>
      project.save((err, doc) => err ? reject(err) : resolve(Project.find({ _id: project._id })))
    );
  }
}

module.exports = Project;
