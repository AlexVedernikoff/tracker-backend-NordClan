const timesheets = require('./../models/queries/timesheet');

exports.sendAction = (type, data, socketIO, userId) => {
  const action = getAction(type, data);
  emit(socketIO, action, userId);
};

exports.sendTaskUpdate = async (data, socketIO) => {
  const action = getAction('update', data);
  const sheets = await timesheets.all({taskId: { $eq: data.id }});
  sheets.forEach(sheet => emit(socketIO, {type: action.type, timesheet: sheet.dataValues}, sheet.userId));
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
    },
    setActiveTask: {
      type: 'GET_ACTIVE_TASK',
      task: data
    }
  };

  return actions[type];
}

function emit (socketIO, action, userId) {
  const channel = `timesheet_user_${userId}`;
  socketIO.to(`user_${ userId }`).emit(channel, action);
}
