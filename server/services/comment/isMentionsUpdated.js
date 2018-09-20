const _ = require('underscore');
const getMentions = require('./getMentions');

module.exports = (newText, oldText) => {
  const oldMentions = getMentions(oldText);
  const newMentions = getMentions(newText);
  const diff = _.difference(newMentions, oldMentions);
  return diff;
};
