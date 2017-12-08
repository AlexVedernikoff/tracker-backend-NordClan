exports.sendAction = (type, data, socketIO, userId) => {
  const action = getAction(type, data);
  emit(socketIO, action, userId);
};

function getAction (type, data) {
  const actions = {
    setActiveTask: {
      type: 'GET_ACTIVE_TASK',
      task: data
    }
  };

  return actions[type];
}

function emit (socketIO, action, userId) {
  const channel = `timesheet_user_${userId}`;
  socketIO.emit(channel, action);
}
