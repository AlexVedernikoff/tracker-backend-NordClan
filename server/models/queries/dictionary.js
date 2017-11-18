const models = require('../');

exports.name = 'dictionary';

exports.getName = function(dictionaryName, valueId) {
  const array = models[dictionaryName].values;
  for (let i = 0; i < array.length; i++){
    if (array[i].id === +valueId){
      return array[i].name;
    }
  }
};