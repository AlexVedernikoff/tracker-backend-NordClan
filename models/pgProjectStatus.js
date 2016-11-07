const sequelize = require('../orm');
const Sequelize = require('sequelize');

const ProjectStatusModel = sequelize.define('project_statuses', {
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestapms: false
  });

module.exports = ProjectStatusModel;
