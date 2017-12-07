exports.sendAction = (type, data, socketIO, userId) => {
  const action = getAction(type, data);
  emit(socketIO, action, userId);
};

function getAction (type, data) {
  const actions = {
    update: {
      type: 'UPDATE_TIMESHEET_SUCCESS',
      timesheet: data
    },
    create: {
      type: 'CREATE_TIMESHEET_SUCCESS',
      timesheet: data
    },
    destroy: {
      type: 'DELETE_TIMESHEET_SUCCESS',
      timesheet: data
    }
  };

  return actions[type];
}

function emit (socketIO, action, userId) {
  const channel = `timesheet_user_${userId}`;
  socketIO.emit(channel, action);
}
