const sequelize = require('../orm');
const Sequelize = require('sequelize');

const ProjectStatus = sequelize.define('project_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = ProjectStatus;
