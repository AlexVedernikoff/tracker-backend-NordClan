const models = require('../');

exports.name = 'dictionary';

exports.getName = async function (dictionaryName, valueId, locale = 'ru') {
  if (!models[dictionaryName]) { return undefined; }

  const array = await models[dictionaryName].findAll() || [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === +valueId) {
      switch (locale) {
      case 'ru':
        return array[i].name;
      case 'en':
        return array[i].nameEn;
      default:
        return array[i].name;
      }
    }
  }

  return undefined;
};
