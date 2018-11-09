const NEED_TO_UPDATE_TASK_COMMENTS = 'NEED_TO_UPDATE_TASK_COMMENTS';

exports.updateTaskComments = (socketIO, excludeUserId, taskId, users) => {
  users.forEach(user => {
    if (excludeUserId !== user.dataValues.userId) {
      emit(socketIO, taskId, user.dataValues.userId);
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
