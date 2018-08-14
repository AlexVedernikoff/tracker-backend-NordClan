const models = require('../');

exports.name = 'dictionary';

exports.getName = function (dictionaryName, valueId, locale = 'ru') {
  if (!models[dictionaryName]) { return undefined; }

  const array = models[dictionaryName].values || [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === +valueId) {
      switch (locale) {
      case 'ru':
        return array[i].name;
      case 'en':
        return array[i].nameEn;
      default:
        return undefined;
      }
    }
  }

  return undefined;
};
