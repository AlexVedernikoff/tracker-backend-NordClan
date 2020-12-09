const http = require('http');
const config = require('../../configs');


/*
класс реализует транспорт для:
1 получения информации о запущинных метриках
2 запуска метрики.
Делегирует обработку запроса своему подписчику.
 */
module.exports = class MetricManager {

  constructor () {
    this.subscriber = {
      startedMetrics: () => {},
      startMetric: () => {},
    };
    this._port = config.metricManagerPort;
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
      'Connection': 'keep-alive',
    });

    if (request.url === '/startedMetrics' && request.method === 'GET'){
      response.write(JSON.stringify(this.subscriber.startedMetrics()));
      response.end();

    } else if (this._regexStartMetric.test(request.url) && request.method === 'POST'){
      const match = request.url.match(this._regexStartMetric);
      if (+match['3'] > 0) {
        request.projectId = +match['3'];
      }

      response.write(JSON.stringify(this.subscriber.startMetric(request)));
      response.end();

    } else {
      response.writeHead(404, {'Content-Type': 'application/json'});
      response.write(JSON.stringify({error: 'NotFound'}));
      response.end();
    }
  }

  subscribe (lisners) {
    this.subscriber = lisners;
  }

};
