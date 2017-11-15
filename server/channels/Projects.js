const Channel = require('./Channel');

class ProjectsChannel extends Channel {
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
