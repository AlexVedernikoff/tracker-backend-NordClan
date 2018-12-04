const http = require('http');


module.exports = class MetricManager {

  constructor () {
    this._startedMetrics = {
      projects: [],
      main: false
    };
    this._port = process.env.WEB_INTERFACE_PORT
      ? +process.env.WEB_INTERFACE_PORT
      : 8081;
    this._server = http.createServer((request, response) => {
      this._requestHandler(request, response);
    });
    this._regexStartMetric = /^\/startMetric((\/([0-9]+))+|\/?)$/;

  }

  startServer () {
    this._server.listen(this._port, () => {
      console.log('server start at port ' + this._port);
    });
  }

  _requestHandler (request, response) {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    });

    if (request.url === '/startedMetrics' && request.method === 'GET'){
      response.write(JSON.stringify(this._startedMetrics));
      // response.end();

    } else if (this._regexStartMetric.test(request.url) && request.method === 'POST'){
      this._startMetric(request);
      response.end();

    } else {
      response.writeHead(404, {'Content-Type': 'application/json'});
      response.write(JSON.stringify({error: 'NotFound'}));
      response.end();

    }
  }

  _startMetric (request) {

  }
};
