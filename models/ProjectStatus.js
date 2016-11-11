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



module.exports = ProjectStatusModel;
