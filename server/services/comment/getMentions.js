module.exports = function (str){
  let match;
  let ids = [];
  const reg = /\{@(\d+|all)\}/gm;
  while ((match = reg.exec(str)) && match) {
    if (match[1] === 'all') {
      ids = ['all'];
      break;
    } else {
      const userId = parseInt(match[1]);
      if (userId > 0) {
        ids.push(userId);
      }
    }
  }
  return ids;
};
