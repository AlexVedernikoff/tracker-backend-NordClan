const { findAllUsersByProjectId } = require('../models/queries/projectUsers');
const { findAllGlobalAdmin } = require('../models/queries/user');

const NEED_TO_UPDATE_JIRA_STATUS = 'NEED_TO_UPDATE_JIRA_STATUS';

async function getGlobalAdmin () {
  return findAllGlobalAdmin();
}

const emitSocket = (socketIO, simtrackProjectId, userId) => {
  const channel = `jira_user_${userId}`;
  socketIO.to(`user_${ userId }`).emit(channel, {
    type: NEED_TO_UPDATE_JIRA_STATUS,
    data: { simtrackProjectId },
    isSocket: true
  });
};

exports.updateJiraStatus = async function (socketIO, simtrackProjectId) {
  const users = await findAllUsersByProjectId(simtrackProjectId);
  const globalAdmins = await getGlobalAdmin();
  const usersIds = users
    .map(user => user.dataValues.userId)
    .concat(globalAdmins.map(user => user.id));
  usersIds.forEach(userId => emitSocket(socketIO, simtrackProjectId, userId));
};
