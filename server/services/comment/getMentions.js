module.exports = function (str){
  let match;
  const ids = [];
  const reg = /\{@(\d+?)\}/gm;
  while ((match = reg.exec(str)) && match) {
    const userId = parseInt(match[1]);
    if (userId > 0) {
      ids.push(userId);
    }
  }
  return ids;
};
