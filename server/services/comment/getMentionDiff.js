const _ = require('underscore');
const getMentions = require('./getMentions');

module.exports = (newText, oldText) => _.difference(getMentions(newText), getMentions(oldText));
