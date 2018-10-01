const createError = require('http-errors');
const models = require('../../models');

module.exports = async (taskId, attachmentId, next) => {
  const comments = await models.Comment.findAll({where: { taskId }});
  const promises = [];
  const id = parseInt(attachmentId);
  try {
    comments.forEach(comment => {
      console.log('comment', comment);
      if (comment.attachmentIds && comment.attachmentIds.indexOf(id) !== -1) {
        let ids = comment.attachmentIds.filter(i => i !== id);
        ids = ids.length ? JSON.stringify(ids) : null;
        promises.push(comment.update({attachmentIds: ids}));
      }
    });
    return Promise.all(promises);
  } catch (e) {
    next(createError(e));
  }
};
