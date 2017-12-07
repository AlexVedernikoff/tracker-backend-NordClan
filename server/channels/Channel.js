const model = require('../models');
const { User, ProjectUsers, Project } = model;
const { userAuthExtension } = require('./../middlewares/Access/userAuthExtension');

exports.sendActionCreator = (getAction, emit) => async (type, data, socketIO, projectId) => {
  const action = getAction(type, data);
  console.log('action');
  console.log(action);
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

