const _ = require('underscore');

exports.diffBetweenObjects = function(firstObject, secondObject, excludeFields) {
  const first = exclude(firstObject, excludeFields);
  const second = exclude(secondObject, excludeFields);
  const diffKeys = getKeysWithDiff(first, second);

  return getDiffObject(diffKeys, firstObject, secondObject);
};

function exclude(object, fields) {
  return fields ? _.omit(object, fields) : object;
}

function getKeysWithDiff(firstObject, secondObject) {
  return _.keys(_.omit(firstObject, (val,key) => {
    return val === secondObject[key];
  }));
}

function getDiffObject(keys, firstObject, secondObject) {
  const diffObj = {};
  keys.forEach((key) => {
    diffObj[key] = {
      newVal: firstObject[key],
      oldVal: secondObject[key],
    };
  });
  return diffObj;
}
