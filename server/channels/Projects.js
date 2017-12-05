const User = require('../models').User;
const ProjectUsers = require('../models').ProjectUsers;
const Project = require('../models').Project;
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
