const _ = require('underscore');
const bcrypt = require('bcrypt-nodejs');

exports.diffBetweenObjects = function (firstObject, secondObject, excludeFields) {
  const first = exclude(firstObject, excludeFields);
  const second = exclude(secondObject, excludeFields);
  const diffKeys = getKeysWithDiff(first, second);

  return getDiffObject(diffKeys, firstObject, secondObject);
};

function exclude (object, fields) {
  return fields ? _.omit(object, fields) : object;
}

function getKeysWithDiff (firstObject, secondObject) {
  return _.keys(_.omit(firstObject, (val, key) => {
    return val === secondObject[key];
  }));
}

function getDiffObject (keys, firstObject, secondObject) {
  const diffObj = {};
  keys.forEach((key) => {
    diffObj[key] = {
      newVal: firstObject[key],
      oldVal: secondObject[key]
    };
  });
  return diffObj;
}

exports.NOTAG = ['no tag', 'без тега'];

exports.bcryptPromise = {
  compare: function (password, originalPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, originalPassword, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);

      });
    });
  },
  hash: function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, null, null, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);

      });
    });
  }
};

exports.middlewareToPromise = async (inputMiddleware, req, res) => {
  const transformMiddleware = (method, request, response) => new Promise((resolve, reject) => {
    method(request, response, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  const middleware = !Array.isArray(inputMiddleware) ? [inputMiddleware] : inputMiddleware;
  for (const item of middleware) {
    await transformMiddleware(item, req, res);
  }
};
