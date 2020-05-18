exports.firstLetterUp = function (value) {
  return value[0].toUpperCase() + value.substring(1);
};

exports.upFirstLettersMultipleWords = string => {
  const wordsArray = string.split('-');
  return wordsArray.reduce((acc, item) => acc + this.firstLetterUp(item), '');
};

exports.firstLetterDown = string => string[0].toLowerCase() + string.substring(1);
