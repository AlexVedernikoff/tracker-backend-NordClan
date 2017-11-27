const email = require('../email');
const { User, ProjectUsers } = require('../models');

module.exports = async function (eventId, input){

  const emails = [];

  let query, users, user, userSubscriptions;

  switch (eventId){

  case (1):
    // добавлена новая задача в проект
    // если я - PM или QA ; если у меня есть подписка на новые задачи в рамках проекта

    // input.projectId

    query = {
      attributes: ProjectUsers.defaultSelect,
      include: [
        {
          as: 'user',
          model: User,
          attributes: ['emailPrimary']
        }
      ],
      where: {
        projectId: input.projectId
        // PM QA
      }
    };
    users = await ProjectUsers.findAll(query);
    users.forEach(function (_user){
      userSubscriptions = JSON.parse(_user.subscriptionsIds);
      if (userSubscriptions.indexOf(eventId) === -1) return;
      emails.push({
        'receiver': _user.emailPrimary,
        'subject': 'Новая задача в проекте',
        'text': 'Новая задача в проекте'
      });
    });
    break;

  case (2):
    // задаче при создании или редактировании присваивается исполнитель
    // если задача присвоена мне и если у меня есть подписка на assign в рамках проекта

    // input.performerId

    query = {
      include: [
        {
          as: 'user',
          model: User,
          attributes: ['emailPrimary']
        }
      ]
    };
    user = await ProjectUsers.findByPrimary(input.performerId, query);
    userSubscriptions = JSON.parse(user.subscriptionsIds);
    if (userSubscriptions.indexOf(eventId) === -1) return;
    emails.push({
      'receiver': user.emailPrimary,
      'subject': 'Новая задача',
      'text': 'Новая задача'
    });
    break;

  case (3):
    // добавлен комментарий к задаче
    // если прокомментировали задачу, в которой я исполнитель ; если прокомментировали задачу которую я кому то назначил ; + к обоим условиям если у меня есть подписка на reply в рамках проекта

    // input.authorId
    // input.performerId

    query = {
      attributes: ProjectUsers.defaultSelect,
      include: [
        {
          as: 'user',
          model: User,
          attributes: ['emailPrimary']
        }
      ],
      where: {
        userId: {
          $in: [input.authorId, input.performerId]
        }
      }
    };
    users = await ProjectUsers.findAll(query);
    users.forEach(function (_user){
      userSubscriptions = JSON.parse(_user.subscriptionsIds);
      if (userSubscriptions.indexOf(eventId) === -1) return;
      emails.push({
        'receiver': _user.emailPrimary,
        'subject': 'Новый комментарий к задаче',
        'text': 'Новый комментарий к задаче'
      });
    });
    break;

  case (4):
    // изменен статус задачи
    // если изменили статус задачи, в которой я исполнитель ; если изменили статус задачи, которую я кому то назначил ;  + к обоим условиям если у меня есть подписка на изменение статуса задач в рамках проекта

    // input.authorId
    // input.performerId

    query = {
      attributes: ProjectUsers.defaultSelect,
      include: [
        {
          as: 'user',
          model: User,
          attributes: ['emailPrimary']
        }
      ],
      where: {
        userId: {
          $in: [input.authorId, input.performerId]
        }
      }
    };
    users = await ProjectUsers.findAll(query);
    users.forEach(function (_user){
      userSubscriptions = JSON.parse(_user.subscriptionsIds);
      if (userSubscriptions.indexOf(eventId) === -1) return;
      emails.push({
        'receiver': _user.emailPrimary,
        'subject': 'Изменен статус задачи',
        'text': 'Изменени статус задачи'
      });
    });
    break;

  case (5):
    // в комментарии есть упоминание
    // если упомянули меня и если у меня есть подписка на уведомления от упоминаний в рамках проекта
    break;

  default:
    break;

  }

  const emailTasks = [];
  emails.forEach(function (emailData){
    emailTasks.push(email.send(emailData));
  });

  return await Promise.all(emailTasks);
};
