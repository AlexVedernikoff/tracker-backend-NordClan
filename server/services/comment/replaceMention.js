const expectedMentionReg = /({@all}|{@[0-9]+})/;
const expectedMentionSeparatorsReg = /[{@}]/g;

const splitCommentByMentions = text =>
  typeof text === 'string' ? text.split(expectedMentionReg).filter(x => x) : [];

const replaceWithMentions = (array, receivers) => {
  return array.map((x) => {
    if (!expectedMentionReg.test(x)) return x;
    const id = x.replace(expectedMentionSeparatorsReg, '');
    const mention = receivers.find(s => s.id === (id !== 'all' ? +id : 'all'));
    return mention ? mention.fullNameRu : id.toUpperCase();
  }).join('');
};

module.exports = async (text, receivers) =>
  replaceWithMentions(splitCommentByMentions(text), receivers);

