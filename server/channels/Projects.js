const User = require('../models').User;
const ProjectUsers = require('../models').ProjectUsers;
const Project = require('../models').Project;
const { userAuthExtension } = require('./../middlewares/Access/userAuthExtension');

class ProjectsChannel {
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
        type: 'PROJECT_CHANGE_SUCCESS',
        changedFields: data
      },
      create: {
        type: 'PROJECT_CREATE_SUCCESS',
        createdProject: data
      }
    };

    return actions[type];
  }

  emit(socketIO, action, userId) {
    const channel = `project_user_${userId}`;
    socketIO.emit(channel, action);
  }
}

module.exports = ProjectsChannel;
