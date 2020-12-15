const { ProjectUsers, ProjectUsersRoles, ProjectRolesDictionary, sequelize } = require('../models');

async function exec (){
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (err){
    console.error('Unable to connect to the database:', err);
    process.exit(-1);
  }

  try {
    const projectUsers = await ProjectUsers.findAll({});
    const projectUsersRolesData = [];
    projectUsers.forEach((projectUser) => {
      ProjectRolesDictionary.values.forEach((projectRole) => {
        projectUsersRolesData.push({
          projectUserId: projectUser.id,
          projectRoleId: projectRole.id,
        });
      });
    });
    await sequelize.transaction(function (t){
      return ProjectUsersRoles.bulkCreate(projectUsersRolesData, {transaction: t});
    });

    process.exit(0);
  } catch (err){
    console.error('exec err', err);
    process.exit(-1);
  }
}

exec();
