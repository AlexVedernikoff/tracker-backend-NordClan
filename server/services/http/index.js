const querystring = require('qs');
const http = require('http');

function httpRequest (params, data, stringify = querystring.stringify) {
  return new Promise(function (resolve, reject) {
    const req = http.request(params, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode));
      }
      let body = [];
      res.on('data', chunk => {
        body.push(chunk);
      });
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (error) {
          reject(error);
        }
        resolve(body);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    if (data) {
      const post_data = stringify(data);
      req.write(post_data);
    }

    req.end();
  });
}


exports.get = (requestOptions) => {

  const options = {
    method: 'GET',
    ...requestOptions,
  };

  return httpRequest(options);
};

exports.post = (requestOptions, postData, stringify) => {

  const options = {
    method: 'POST',
    ...requestOptions,
  };

  return httpRequest(options, postData, stringify);
};
