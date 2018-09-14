const axios = require('axios');

exports.postRequest = function (uri, params) {
  return new Promise(function (resolve, reject) {
    axios.post(uri, params)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

exports.getRequest = function (uri) {
  return new Promise(function (resolve, reject) {
    axios.get(uri)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
