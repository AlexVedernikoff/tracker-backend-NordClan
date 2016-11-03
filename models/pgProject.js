const sequelize = require('../orm');
const Sequelize = require('sequelize');
const ProjectStatus = require('./pgProjectStatus');

const Project = sequelize.define('projects', {
    name: { type: Sequelize.STRING, allowNull: false },
    start_date: Sequelize.DATE,
    ps_id: Sequelize.STRING
  });

Project.belongsTo(ProjectStatus, { foreignKey: 'status_id' });

module.exports = Project;
/*
--------------------------
User.create({
  username: 'john-doe',
  password: generatePasswordHash('i-am-so-great')
}).then(function(user) {
        user.save().then(function() {

})

})
--------------------------------
*/
