const _ = require('underscore');

module.exports = async (comment, receivers, mentions) => {
  if (mentions.includes('all')) {
    comment.text = comment.text.replace(/\{@(all)\}/gm, 'ALL').replace(/\{@(\d+)\}/gm, '');
  } else {
    mentions.forEach(id => {
      const name = _.find(receivers, {id: id}).fullNameRu;
      comment.text = comment.text.replace(new RegExp(`\\{@(${id})}`, 'gm'), name);
    });
  }
  return comment;
};
