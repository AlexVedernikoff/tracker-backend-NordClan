const email = require('../email');
const _ = require('underscore');
const { Sequelize, Comment, User, Project, ProjectUsers, ProjectUsersSubscriptions, Task, Sprint, TaskStatusesDictionary, TaskTypesDictionary, ProjectRolesDictionary } = require('../../models');

module.exports = async function (eventId, input){
  const emails = [];
  let receivers, task, comment;

  switch (eventId){

  case (1): // need to rework rolesIds
    // event description : new task added to project
    // receivers : project's PM and QA (which has subscription)
    // input = { taskId }

    /*task = await getTask(input.taskId);
    receivers = await ProjectUsers.findAll({
      // attributes: [],
      include: [
        {
          as: 'user',
          model: User,
          //attributes: User.defaultSelect
        },
        {
          as: 'subscriptions',
          model: ProjectUsersSubscriptions,
          //attributes: ProjectUsersSubscriptions.defaultSelect
        }
      ],
      where: {
        projectId: task.project.id,
        rolesIds: {
          $contains: [ProjectRolesDictionary.values[1].id+'', ProjectRolesDictionary.values[8].id+'']// PM QA TODO
        }
      }
    });

    receivers.forEach(function (projectUser){
      if (!isUserSubscribed(eventId, projectUser)) return;
      const emailTemplate = email.template('newTaskForQAPM', { task });
      emails.push({
        'receiver': projectUser.user.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });*/

    break;

  case (2):
    // event description : task assigned to performer
    // receivers : task performer (which has subscription)
    // input = { taskId }

    task = await getTask(input.taskId);
    receivers = [task.performer];

    receivers.forEach(function (user){
      if (!isUserSubscribed(eventId, user.usersProjects[0])) return;
      const emailTemplate = email.template('newTaskForPerformer', { task });
      emails.push({
        'receiver': user.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;

  case (3):
    // event description : new comment to task
    // receivers : task author, task performer (which has subscription)
    // input = { taskId, commentId }

    task = await getTask(input.taskId);
    comment = await Comment.findByPrimary(input.commentId, {
      include: [
        {
          as: 'author',
          model: User,
        }
      ]
    });
    plainComment = comment.get({'plain' : true});
    receivers = task.author.id === task.performer.id ? [task.author] : [task.author, task.performer];

    receivers.forEach(function (user){
      if (!isUserSubscribed(eventId, user.usersProjects[0])) return;
      const emailTemplate = email.template('newTaskComment', { task, comment });
      emails.push({
        'receiver': user.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;

  case (4):
    // event description : task status changed
    // receivers : task author, task performer (which has subscription)
    // input = { taskId }

    task = await getTask(input.taskId);
    receivers = task.author.id === task.performer.id ? [task.author] : [task.author, task.performer];

    receivers.forEach(function (user){
      if (!isUserSubscribed(eventId, user.usersProjects[0])) return;
      const emailTemplate = email.template('newTaskComment', { task });
      emails.push({
        'receiver': user.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;

  case (5): // need to implement that on backend
    // event description : task comment has mention
    // receivers : mentioned user (which has subscription)
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

function isUserSubscribed (eventId, projectUser){
  return (projectUser.subscriptions && _.find(projectUser.subscriptions, { projectEventId : eventId}) );
}

function getTask (id){
  return Task.findByPrimary(id, {
    include: [
      {
        as: 'taskStatus',
        model: TaskStatusesDictionary
      },
      {
        as: 'type',
        model: TaskTypesDictionary
      },
      {
        as: 'project',
        model: Project
      },
      {
        as: 'sprint',
        model: Sprint
      },
      {
        as: 'author',
        model: User,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            where: Sequelize.literal('"author.usersProjects"."project_id"="Task"."project_id"'),
            include: [
              {
                as: 'subscriptions',
                model: ProjectUsersSubscriptions
              }
            ]
          }
        ]
      },
      {
        as: 'performer',
        model: User,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            where: Sequelize.literal('"performer.usersProjects"."project_id"="Task"."project_id"'),
            include: [
              {
                as: 'subscriptions',
                model: ProjectUsersSubscriptions
              }
            ]
          }
        ]
      }
    ]
  });
}
