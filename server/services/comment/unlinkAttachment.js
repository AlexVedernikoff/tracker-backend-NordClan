const createError = require('http-errors');
const models = require('../../models');

module.exports = async (taskId, attachmentId, next) => {
  const comments = await models.Comment.findAll({where: { taskId }});
  const promises = [];
  try {
    comments.forEach(comment => {
      if (comment.attachmentIds && comment.attachmentIds.indexOf(attachmentId) !== -1) {
        let ids = JSON.parse(comment.attachmentIds).filter(i => i !== parseInt(attachmentId));
        ids = ids.length ? JSON.stringify(ids) : null;
        promises.push(comment.update({attachmentIds: ids}));
      }
    });
    return Promise.all(promises);
  } catch (e) {
    next(createError(e));
  }
};
