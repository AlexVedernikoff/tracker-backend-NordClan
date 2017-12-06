const { sendAction } = require('./Channel');

exports.sendAction = async (type, data, socketIO, projectId) => {
  sendAction(type, data, socketIO, projectId, getAction, emit);
};

function getAction (type, data) {
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

function emit (socketIO, action, userId) {
  const channel = `project_user_${userId}`;
  socketIO.emit(channel, action);
}
