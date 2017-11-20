const User = require('../models').User;
const ProjectUsers = require('../models').ProjectUsers;
const Project = require('../models').Project;
const { userAuthExtension } = require('./../middlewares/Access/userAuthExtension');

class TasksChannel {
  async sendAction(type, data, socketIO, projectId) {
    const action = this.getAction(type, data);
    const users = await User.findAll({
      include: [
        {
          as: 'usersProjects',
          model: ProjectUsers
        },
        {
          as: 'authorsProjects',
          model: Project
        }
      ]
    });

    users
      .map(user => userAuthExtension(user))
      .filter(user => user.isUserOfProject(projectId))
      .forEach(user => {
        this.emit(socketIO, action, user.dataValues.id);
      });
  }

  getAction(type, data) {
    const actions = {
      update: {
        type: 'TASK_CHANGE_REQUEST_SUCCESS',
        changedFields: data
      },
      //TODO передаю отдельно task и его параметры так как на фронтенде
      //action именно такие данные использует. Потом надо будет на фронте и
      //здесь отрефакторить
      create: {
        type: 'TASK_CREATE_REQUEST_SUCCESS',
        projectId: data.projectId,
        sprintId: data.sprintId,
        taskId: data.taskId,
        task: data
      }
    };

    return actions[type];
  }

  emit(socketIO, action, userId) {
    const channel = `task_user_${userId}`;
    socketIO.emit(channel, action);
  }
}

module.exports = TasksChannel;
