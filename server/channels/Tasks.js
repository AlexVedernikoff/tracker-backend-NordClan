const { sendActionCreator } = require('./Channel');

function getAction (type, data) {
  const actions = {
    update: {
      type: 'TASK_CHANGE_REQUEST_SUCCESS',
      changedFields: data,
    },
  };

  return actions[type];
}

function emit (socketIO, action, userId) {
  const channel = `task_user_${userId}`;
  socketIO.sockets.to(`user_${ userId }`).emit(channel, action);
}

exports.sendAction = sendActionCreator(getAction, emit);
