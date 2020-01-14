const models = require('../../server/models');
const emailService = require('../../server/services/email');
const { email: { templateExternalUrl } } = require('../../server/configs');


const sendMessage = async function (usr, str) {
  const usersToProjectIds = await models.ProjectUsers.findAll({
    where: {
      userId: usr.id
    },
    attributes: [
      'projectId'
    ]
  });
  if (usersToProjectIds === null || usersToProjectIds.length === 0) {
    return;
  }
  const listUsers = [];
  for (const id of usersToProjectIds) {
    const usrs = await models.ProjectUsers.findAll({
      where: {
        projectId: id.dataValues.projectId
      }
    });
    if (usrs !== null
            && usrs.length !== 0) {
      usrs.forEach(a => {
        listUsers.push(a.dataValues);
      });

    }
  }
  if (listUsers === null || listUsers.length === 0) {
    return;
  }
  const leaderUsers = [];
  for (const listUsersElement of listUsers) {
    const findResult = await models.ProjectUsersRoles.findAll({
      where: {
        projectUserId: listUsersElement.id,
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
    if (findResult !== null && !leaderUsers.includes(listUsersElement.userId)) {
      leaderUsers.push(listUsersElement.userId);
    }
  }
  const emails = [];
  for (const leader of leaderUsers) {
    const result = await models.User.findOne({
      where: {
        id: leader,
        active: 1
      }
    });
    if (result.emailPrimary !== null && !emails.includes(result.emailPrimary)) {
      emails.push(result.dataValues.emailPrimary);
    }
  }
  if (emails === null || emails.length === 0) {
    return;
  }
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


exports.checkExternalUsers = async function () {
  const todayDateTime = new Date();

  const today = new Date(todayDateTime.getFullYear(),
    todayDateTime.getMonth(),
    todayDateTime.getDate());

  const users = await models.User.findAll({
    where: {
      globalRole: models.User.EXTERNAL_USER_ROLE,
      active: 1,
      expiredDate: {
        $gt: today
      }
    }
  });


  users.filter(usr => {
    const dateTimeExpire = new Date(usr.expiredDate);
    const razn = Math.round((dateTimeExpire - today) / (1000 * 60 * 60 * 24));

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
};


