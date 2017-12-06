const model = require('../models');
const { User, ProjectUsers, Project } = model;
const { userAuthExtension } = require('./../middlewares/Access/userAuthExtension');

exports.sendAction = async (type, data, socketIO, projectId) => {
  const action = getAction(type, data);
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

  users.forEach(user => {
    const extensibleUser = userAuthExtension(user);
    if (extensibleUser.isUserOfProject(projectId)) {
      emit(socketIO, action, user.dataValues.id);
    }
  });
};

function getAction (type, data) {
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

function emit (socketIO, action, userId) {
  const channel = `task_user_${userId}`;
  socketIO.emit(channel, action);
}
