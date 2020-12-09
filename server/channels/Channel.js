const model = require('../models');
const { User, ProjectUsers, Project } = model;
const { userAuthExtension, statuses } = require('./../middlewares/Access/userAuthExtension');

const isDevOpsTask = (data) => {
  return data.isDevOps;
};

const isDevOpsUser = (user) => {
  return user.dataValues.globalRole === statuses.DEV_OPS;
};

exports.sendActionCreator = (getAction, emit) => async (type, data, socketIO, projectId) => {
  const action = getAction(type, data);
  const users = await User.findAll({
    include: [
      {
        as: 'usersProjects',
        model: ProjectUsers,
      },
      {
        as: 'authorsProjects',
        model: Project,
      },
    ],
  });

  users.forEach(user => {
    const extensibleUser = userAuthExtension(user);
    if (extensibleUser.isUserOfProject(projectId) || (isDevOpsTask(data) && isDevOpsUser(user))) {
      emit(socketIO, action, user.dataValues.id);
    }
  });
};

