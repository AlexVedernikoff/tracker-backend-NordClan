const request = require('request');
const config = require('./server/configs');

const port = config.metricManagerPort;
request.post(`http://localhost:${port}/startMetric`);
