const models = require('../../models');

module.exports = (taskId, attachmentId) => {
  return new Promise((resolve, reject) => {
    models.Comment
      .findAll({where: { taskId }})
      .then(comments => {
        const propmises = [];
        comments.forEach(comment => {
          if (comment.attachmentIds && comment.attachmentIds.indexOf(attachmentId) !== -1) {
            let ids = JSON.parse(comment.attachmentIds).filter(i => i !== parseInt(attachmentId));
            ids = ids.length ? JSON.stringify(ids) : null;
            propmises.push(comment.update({attachmentIds: ids}));
          }
        });
        return Promise.all(propmises);
      })
      .then(() => { resolve(); })
      .catch((err) => {
        reject(err);
      });
  });
};
