const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Project = require('./Project');

const ProjectStatusModel = sequelize.define('project_statuses', {
    name: { type: Sequelize.STRING, allowNull: false },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE
    }
  }, {
    timestapms: false
  });

class ProjectStatus {
  constructor() {}

  static get model() {
    return ProjectStatusModel;
  }

  static find(params) {
    let find = ProjectStatusModel.findOne({ where: params });

    return find.then(projectStatus => projectStatus ? (new ProjectStatus())
    .setData(projectStatus.toJSON(), true) : projectStatus);
  }

  setData(data = {}, isSafe) {
    if (isSafe) {
      this.id = data.id;
    }

    data = data.toObject ? data.toObject() : data;
    Object.keys(data).map(k => this[k] = data[k]);

    return this;
  }
}

module.exports = ProjectStatus;
