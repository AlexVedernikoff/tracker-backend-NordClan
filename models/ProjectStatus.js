const sequelize = require('../orm');
const Sequelize = require('sequelize');
const Project = require('./Project');

const ProjectStatusModel = sequelize.define('project_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

ProjectStatusModel.hasMany(Project.model, { foreignKey: 'status_id' });

module.exports = ProjectStatusModel;
