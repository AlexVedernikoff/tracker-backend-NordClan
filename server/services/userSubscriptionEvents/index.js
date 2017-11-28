const email = require('../email');
const { Sequelize, Comment, User, Project, ProjectUsers, ProjectUsersSubscriptions, Task, Sprint, TaskStatusesDictionary, TaskTypesDictionary, ProjectRolesDictionary } = require('../models');

module.exports = async function (eventId, input){

  const emails = [];
  let receivers, task, comment;

  switch (eventId){

  case (1):
    // event description : new task added to project
    // receivers : project's PM and QA (which has subscription)
    // input = { taskId }

    task = await getTask(input.taskId);
    receivers = await ProjectUsers.findAll({
      attributes: ProjectUsers.defaultSelect,
      include: [
        {
          as: 'user',
          model: User,
          attributes: User.defaultSelect
        },
        {
          as: 'subscriptions',
          model: ProjectUsersSubscriptions,
          attributes: ProjectUsersSubscriptions.defaultSelect
        }
      ],
      where: {
        projectId: task.project.id,
        rolesIds: {
          $contains: [ProjectRolesDictionary.values[1].id, ProjectRolesDictionary.values[8].id]// PM QA
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
    });

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
      attributes: Comment.defaultSelect,
      include: [
        {
          as: 'author',
          model: User,
          attributes: User.defaultSelect
        }
      ]
    });
    receivers = [task.author, task.performer];

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

  case (4):
    // event description : task status changed
    // receivers : task author, task performer (which has subscription)
    // input = { taskId }

    task = await getTask(input.taskId);
    receivers = [task.author, task.performer];

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

  case (5):
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
  //return (projectUser.subscriptions && projectUser.subscriptions.indexOf(eventId) !== -1);
  return true;
}

function getTask (id){
  return Task.findByPrimary(id, {
    attributes: Task.defaultSelect,
    include: [
      {
        as: 'taskStatus',
        model: TaskStatusesDictionary,
        attributes: TaskStatusesDictionary.defaultSelect
      },
      {
        as: 'type',
        model: TaskTypesDictionary,
        attributes: TaskTypesDictionary.defaultSelect
      },
      {
        as: 'project',
        model: Project,
        attributes: Project.defaultSelect
      },
      {
        as: 'sprint',
        model: Sprint,
        attributes: Sprint.defaultSelect
      },
      {
        as: 'author',
        model: User,
        attributes: User.defaultSelect,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            attributes: ProjectUsers.defaultSelect,
            where: {
              projectId: Sequelize.col('task.projectId')
            },
            include: [
              {
                as: 'subscriptions',
                model: ProjectUsersSubscriptions,
                attributes: ProjectUsersSubscriptions.defaultSelect
              }
            ]
          }
        ]
      },
      {
        as: 'performer',
        model: User,
        attributes: User.defaultSelect,
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            attributes: ProjectUsers.defaultSelect,
            where: {
              projectId: Sequelize.col('task.projectId')
            },
            include: [
              {
                as: 'subscriptions',
                model: ProjectUsersSubscriptions,
                attributes: ProjectUsersSubscriptions.defaultSelect
              }
            ]
          }
        ]
      }
    ]
  });
}
