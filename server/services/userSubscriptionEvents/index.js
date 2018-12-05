const email = require('../email');
const _ = require('underscore');
const { Sequelize, Comment, User, Project, ProjectUsers, ProjectUsersSubscriptions, ProjectUsersRoles, Task, Sprint, TaskStatusesDictionary, TaskTypesDictionary, ProjectRolesDictionary } = require('../../models');
const { getMentions, replaceMention } = require('../../services/comment');
const { emailForDevOpsNotify } = require('../../configs');

module.exports = async function (eventId, input, user){
  const emails = [];
  let receivers, task, comment, projectRolesValues, mentionedUsers, taskComment, mentions, userIds, project;

  switch (eventId){

  case (1):
    // event description : new task added to project
    // receivers : project's PM and QA
    // input = { taskId }

    task = await getTask(input.taskId);
    projectRolesValues = await ProjectRolesDictionary.findAll({
      attributes: ['id'],
      where: {
        nameEn: {
          $or: ['PM', 'QA']
        }
      }});
    projectRolesValues = projectRolesValues.map(el => el.id);
    receivers = await ProjectUsers.findAll({
      include: [
        {
          as: 'user',
          model: User
        },
        {
          as: 'subscriptions',
          model: ProjectUsersSubscriptions
        },
        {
          as: 'roles',
          model: ProjectUsersRoles,
          where: {
            projectRoleId: {
              '$in': projectRolesValues// PM QA
            }
          }
        }
      ],
      where: {
        projectId: task.project.id
      }
    });

    receivers.forEach(function (projectUser){
      if (!isUserSubscribed(eventId, projectUser.get({ plain: true }))) return;
      if (user.id === projectUser.user.id) return;
      const emailTemplate = email.template('newTaskForQAPM', { task });
      emails.push({
        'receiver': projectUser.user.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    if (task.dataValues.isDevOps) {
      const emailTemplate = email.template('newTaskForQAPM', { task });
      emails.push({
        'receiver': emailForDevOpsNotify,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    }

    break;

  case (2):
    // event description : task assigned to performer
    // receivers : task performer
    // input = { taskId }

    task = await getTask(input.taskId);
    taskComment = task.comments[0];
    mentions = getMentions(taskComment.text);
    userIds = await User.findAll({
      where: {
        id: _.unique(mentions)
      },
      attributes: User.defaultSelect
    });
    taskComment.text = mentions.length ? await replaceMention(taskComment.text, userIds) : taskComment.text;
    receivers = task.performer ? [task.performer] : [];

    receivers.forEach(function (performer) {
      if (!isUserSubscribed(eventId, performer.usersProjects[0])) return;
      if (user.id === performer.dataValues.id) return;
      const emailTemplate = email.template('newTaskForPerformer', { task });
      emails.push({
        'receiver': performer.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;

  case (3): {
    // event description : new comment to task
    // receivers : task author, task performer, comment mentions
    // input = { taskId, commentId, authorId }

    task = await getTask(input.taskId);
    comment = _.find(task.comments, { id: input.commentId });
    const mentions = getMentions(comment.text);
    if (input.authorId && !~mentions.indexOf(input.authorId)) {
      mentions.push(input.authorId);
    }
    let receiverIds = ((!task.performer || task.author.id === task.performer.id) ? [task.author] : [task.author, task.performer])
      .map(receiver => receiver.dataValues.id);
    if (mentions.includes('all')) {
      const projectUsers = await ProjectUsers.findAll({
        attributes: ['user_id'],
        where: {
          projectId: task.project.id
        }
      });
      receiverIds = [
        ...projectUsers.map(projectUser => projectUser.dataValues.user_id),
        task.project.authorId
      ];
    } else if (mentions.length) {
      receiverIds = [
        ...receiverIds,
        ...mentions
      ];
    }


    receivers = await User.findAll({
      where: {
        id: _.unique(receiverIds)
      },
      include: [
        {
          as: 'usersProjects',
          model: ProjectUsers,
          where: Sequelize.literal(`"usersProjects"."project_id"=${task.projectId}`),
          include: [
            {
              as: 'subscriptions',
              model: ProjectUsersSubscriptions
            }
          ]
        }
      ]
    });

    comment.text = mentions.length ? await replaceMention(comment.text, receivers) : comment.text;

    receivers.forEach(function (receiver){
      if (!receiver.usersProjects || receiver.usersProjects.length === 0 || !isUserSubscribed(eventId, receiver.usersProjects[0])) return;
      if (user.id === receiver.dataValues.id) return;
      const emailTemplate = mentions.includes(receiver.id) ? email.template('newTaskCommentMention', { task, comment }) : email.template('newTaskComment', { task, comment });
      emails.push({
        'receiver': receiver.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;
  }
  case (4):
    // event description : task status changed to done
    // receivers : PM
    // input = { taskId }

    task = await getTask(input.taskId);
    projectRolesValues = await ProjectRolesDictionary.find({
      attributes: ['id'],
      where: {
        nameEn: 'PM'
      }});
    receivers = await ProjectUsers.findAll({
      include: [
        {
          as: 'user',
          model: User
        },
        {
          as: 'subscriptions',
          model: ProjectUsersSubscriptions
        },
        {
          as: 'roles',
          model: ProjectUsersRoles,
          where: {
            projectRoleId: {
              '$in': [projectRolesValues.id]// PM
            }
          }
        }
      ],
      where: {
        projectId: task.project.id
      }
    });

    receivers.forEach(function (receiver){
      if (!receiver.usersProjects || receiver.usersProjects.length === 0 || !isUserSubscribed(eventId, receiver.usersProjects[0])) return;
      const emailTemplate = email.template('taskCompleted', { task });
      emails.push({
        'receiver': receiver.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });

    break;

  case (5): {
    // event description : task comment has mention
    // receivers : mentioned users (which has subscription)
    // input : { taskId, commentId }
    task = await getTask(input.taskId);
    comment = _.find(task.comments, { id: input.commentId });
    const mentions = getMentions(comment.text);
    let receiverIds;
    if (user[0] === 'all') {
      const projectUsers = await ProjectUsers.findAll({
        attributes: ['user_id'],
        where: {
          projectId: task.project.id
        }
      });
      receiverIds = [
        ...projectUsers.map(projectUser => projectUser.dataValues.user_id)
      ];
    } else {
      receiverIds = user;
    }
    receivers = await User.findAll({
      where: {
        id: _.unique(receiverIds)
      },
      include: [
        {
          as: 'usersProjects',
          model: ProjectUsers,
          where: Sequelize.literal(`"usersProjects"."project_id"=${task.projectId}`),
          include: [
            {
              as: 'subscriptions',
              model: ProjectUsersSubscriptions
            }
          ]
        }
      ]
    });

    if (mentions[0] !== 'all') {
      mentionedUsers = await User.findAll({
        where: {
          id: _.unique(mentions)
        },
        include: [
          {
            as: 'usersProjects',
            model: ProjectUsers,
            where: Sequelize.literal(`"usersProjects"."project_id"=${task.projectId}`),
            include: [
              {
                as: 'subscriptions',
                model: ProjectUsersSubscriptions
              }
            ]
          }
        ]
      });
    } else {
      mentionedUsers = receivers;
    }

    comment.text = mentions.length ? await replaceMention(comment.text, mentionedUsers) : comment.text;

    receivers.forEach(receiver => {
      if (!isUserSubscribed(eventId, receiver.usersProjects[0])) return; // if user subscribed to this event
      if (user.id === comment.author.dataValues.id) return; // if user mentioned himself
      const emailTemplate = email.template('newTaskCommentMention', { task, comment });
      emails.push({
        'receiver': receiver.emailPrimary,
        'subject': emailTemplate.subject,
        'html': emailTemplate.body
      });
    });
    break;
  }

  case (6):
    // event description : error when calculating metrics
    project = await Project.findById(input.projectId);
    if (input.recipients) {
      const emailTemplate = email.template('metricsProcessFailed', { error: input.error, project: project, user: user });
      input.recipients.forEach(emailRecipient => {
        emails.push({
          'receiver': emailRecipient,
          'subject': emailTemplate.subject,
          'html': emailTemplate.body
        });
      });
    }
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
  return (projectUser.subscriptions && _.find(projectUser.subscriptions, { projectEventId: eventId}));
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
        as: 'comments',
        model: Comment,
        include: [
          {
            as: 'author',
            model: User
          }
        ]
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
            ],
            required: false
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
            ],
            required: false
          }
        ]
      }
    ]
  });
}
