const { ProjectUsers, ProjectUsersSubscriptions, ProjectEventsDictionary, sequelize } = require('../models');

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
    const projectUsersSubscriptionsData = [];
    projectUsers.forEach((projectUser) => {
      ProjectEventsDictionary.values.forEach((projectEvent) => {
        projectUsersSubscriptionsData.push({
          projectUserId: projectUser.id,
          projectEventId: projectEvent.id
        });
      });
    });
    await sequelize.transaction(function (t){
      return ProjectUsersSubscriptions.bulkCreate(projectUsersSubscriptionsData, {transaction: t});
    });

    process.exit(0);
  } catch (err){
    console.error('exec err', err);
    process.exit(-1);
  }
}

exec();
