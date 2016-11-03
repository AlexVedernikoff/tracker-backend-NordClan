const sequelize = require('../orm');
const Sequelize = require('sequelize');
const ProjectStatus = require('./pgProjectStatus');

const Project = sequelize.define('projects', {
    name: { type: Sequelize.STRING, allowNull: false},
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

Project.findById(123).then(function(project) {
  // project will be an instance of Project and stores the content of the table entry
  // with id 123. if such an entry is not defined you will get null
})
----------------------------------------------

Project.findAll({
  where: {
    id: {
      $and: {a: 5}           // AND (a = 5)
      $or: [{a: 5}, {a: 6}]  // (a = 5 OR a = 6)
      $gt: 6,                // id > 6
      $gte: 6,               // id >= 6
      $lt: 10,               // id < 10
      $lte: 10,              // id <= 10
      $ne: 20,               // id != 20
      $between: [6, 10],     // BETWEEN 6 AND 10
      $notBetween: [11, 15], // NOT BETWEEN 11 AND 15
      $in: [1, 2],           // IN [1, 2]
      $notIn: [1, 2],        // NOT IN [1, 2]
      $like: '%hat',         // LIKE '%hat'
      $notLike: '%hat'       // NOT LIKE '%hat'
      $iLike: '%hat'         // ILIKE '%hat' (case insensitive)  (PG only)
      $notILike: '%hat'      // NOT ILIKE '%hat'  (PG only)
      $overlap: [1, 2]       // && [1, 2] (PG array overlap operator)
      $contains: [1, 2]      // @> [1, 2] (PG array contains operator)
      $contained: [1, 2]     // <@ [1, 2] (PG array contained by operator)
      $any: [2,3]            // ANY ARRAY[2, 3]::INTEGER (PG only)
    },
    status: {
      $not: false,           // status NOT FALSE
    }
  }
})
------------------------------------------
Project.findAll({ where: { name: 'A Project' } }).then(function(projects) {
  // projects will be an array of Project instances with the specified name
})

*/