const { findAllGlobalAdmin, findAllDevOps } = require('../models/queries/user');

const NEED_TO_UPDATE_TASK_COMMENTS = 'NEED_TO_UPDATE_TASK_COMMENTS';

async function getGlobalAdmin () {
  return findAllGlobalAdmin();
}

async function getDevOpsUsers () {
  return findAllDevOps();
}

exports.updateTaskComments = async (socketIO, excludeUserId, taskId, users) => {
  const admins = await getGlobalAdmin();
  const devOpsUsers = await getDevOpsUsers();
  const userIds = users
    .map(user => user.dataValues.userId)
    .concat(admins.map(user => user.id))
    .concat(devOpsUsers.map(user => user.id));

  userIds.forEach(userId => {
    if (excludeUserId !== userId) {
      emit(socketIO, taskId, userId);
    }
  });
};

function emit (socketIO, taskId, userId) {
  const channel = `comments_user_${userId}`;
  socketIO.to(`user_${ userId }`).emit(channel, {
    type: NEED_TO_UPDATE_TASK_COMMENTS,
    data: { taskId },
    isSocket: true
  });
}
