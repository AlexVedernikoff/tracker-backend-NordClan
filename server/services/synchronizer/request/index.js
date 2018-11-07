const axios = require('axios');

exports.post = function (uri, params, options) {
  return new Promise(function (resolve, reject) {
    axios
      .post(uri, params, options)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

exports.get = function (uri, options) {
  return new Promise(function (resolve, reject) {
    axios
      .get(uri, options)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
