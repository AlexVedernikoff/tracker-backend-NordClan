const User = require('../../models').User;

module.exports = {
  sendAction: async (type, data, socketIO) => {
    const action = getAction(type, data);
    const users = await User.findAll();

    //TODO вместо filter брать сразу из бд готовую выборку
    users
      .filter(selectUsers)
      .forEach(user => {
        emit(socketIO, action, user.id);
      });
  }
};

function getAction(type, data) {
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

//TODO будет использоваться для разделения доступа
function selectUsers(user) {
  return true;
}

function emit(socketIO, action, userId) {
  const channel = `task_user_${userId}`;
  socketIO.emit(channel, action);
}
