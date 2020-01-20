const models = require('/home/inna/projects/track-back/server/models');
const emailService = require('/home/inna/projects/track-back/server/services/email');
const { email: { templateExternalUrl } } = require('/home/inna/projects/track-back/server/configs');

const sendEmails = async function (usr, str, emails) {
  const template = emailService.template('checkExternalUser',
    {
      dayCount: str,
      user: {
        login: usr.login,
        email: usr.emailPrimary,
        description: usr.description
      }
    }, templateExternalUrl);

  emails.forEach(email => {
    emailService.send({
      receiver: email,
      subject: template.subject,
      html: template.body
    });
  });
};

const getProjectsIds = async function (id) {
  try {
    const result = await models.ProjectUsers.findAll({
      where: {
        userId: id
      },
      attributes: [
        'projectId'
      ]
    });
    return result;
  } catch (ex) {
    return null;
  }
};

const getUsersInProject = async function (ids) {
  try {
    const result = await models.ProjectUsers.findAll({
      where: {
        projectId: ids
      }
    });
    return result;
  } catch (ex) {
    return null;
  }
};

const getUsersProjectRoles = async function (ids) {
  try {
    const result = await models.ProjectUsersRoles.findAll({
      where: {
        projectUserId: ids,
        $or: [
          {
            projectRoleId: 1
          },
          {
            projectRoleId: 2
          }
        ]
      }
    });

    return result;
  } catch (ex) {
    return null;
  }
};

const getLeaderUsers = async function (ids) {
  try {
    const result = await models.User.findAll({
      where: {
        id: ids,
        active: 1
      }
    });
    return result;
  } catch (ex) {
    return null;
  }
};

const sendMessage = async function (usr, str) {
  try {
    const listUsers = [];
    const listProjectUsers = [];
    const projectIdsArray = [];
    const leaderUsers = [];
    const emails = [];

    const usersToProjectIds = await getProjectsIds(usr.id);
    if (usersToProjectIds === null || usersToProjectIds.length === 0) return;

    usersToProjectIds.forEach(id => {
      projectIdsArray.push(id.dataValues.projectId);
    });

    const usrs = await getUsersInProject(projectIdsArray);
    if (usrs === null || usrs.length === 0) return;

    usrs.forEach(a => {
      listUsers.push(a.dataValues);
      listProjectUsers.push(a.dataValues.id);
    });
    if (listProjectUsers.length === 0
      || listUsers.length === 0) return;

    const findResult = await getUsersProjectRoles(listProjectUsers);
    if (findResult === null || usrs.length === 0) return;

    findResult.forEach(result => {
      const find = listUsers.find(a => a.id === result.dataValues.projectUserId);
      if (find !== null
        && !leaderUsers.includes(find.userId)) {
        leaderUsers.push(find.userId);
      }
    });

    if (leaderUsers.length === 0) return;

    const results = await getLeaderUsers(leaderUsers);
    if (results === null || results.length === 0) return;

    results.forEach(res => {
      if (res.dataValues.emailPrimary !== null
        && !emails.includes(res.dataValues.emailPrimary)) {
        emails.push(res.dataValues.emailPrimary);
      }
    });

    if (emails.length === 0) return;
    console.log('start sendings');
    await sendEmails(usr, str, emails);
  } catch (e) {
    console.log('fail into sendMessage');
    console.log(e);
    console.log(e.response);
    console.log(e.message);
  }
};


module.exports = async function () {
  try {
    console.log('function start working');
    const todayDateTime = new Date();
    const today = new Date(
      todayDateTime.getFullYear(),
      todayDateTime.getMonth(),
      todayDateTime.getDate()
    );


    console.log('before async');
    const users = await models.User.findAll({
      where: {
        globalRole: models.User.EXTERNAL_USER_ROLE,
        active: 1,
        expiredDate: {
          $gt: today
        }
      }
    });

    console.log('after async');
    users.forEach(usr => {
      const dateTimeExpire = new Date(usr.expiredDate);
      const razn = Math.round((dateTimeExpire - today) / (1000 * 60 * 60 * 24));


      console.log('before start analitics');
      console.log('days difference: ' + razn);
      if (razn === 30) {
        sendMessage(usr.dataValues, 'месяц');
      }
      if (razn === 3) {
        sendMessage(usr.dataValues, '3 дня');
      }
      if (razn === 1) {
        sendMessage(usr.dataValues, 'день');
      }
    });
  } catch (e) {
    console.log('fail into module.exports = async function');
    console.log(e);
    console.log(e.response);
    console.log(e.message);
  }
};
