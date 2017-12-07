const { sendActionCreator } = require('./Channel');

function getAction (type, data) {
  const actions = {
    setActiveTask: {
      type: 'GET_ACTIVE_TASK',
      task: data
    },
    update: {
      type: 'TASK_CHANGE_REQUEST_SUCCESS',
      changedFields: data
    },
    //TODO передаю отдельно task и его параметры так как на фронтенде
    //action именно такие данные использует. Потом надо будет на фронте и
    //здесь отрефакторить
    create: {
      type: 'TASK_CREATE_REQUEST_SUCCESS',
      projectId: data ? data.projectId : null,
      sprintId: data ? data.sprintId : null,
      taskId: data ? data.taskId : null,
      task: data
    }
  };

  return actions[type];
}

function emit (socketIO, action, userId) {
  const channel = `task_user_${userId}`;
  socketIO.emit(channel, action);
}

exports.sendAction = sendActionCreator(getAction, emit);
