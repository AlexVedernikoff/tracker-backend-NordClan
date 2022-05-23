const express = require('express');
const config = require('./configs');
const { initApp } = require('./initApp');
const { useJwtAuth } = require('./useJwtAuth');
const app = express();

const httpServer = require('http').Server(app);

exports.runHttpServer = function () {
  initApp(app);

  useJwtAuth(app, httpServer);

  httpServer.listen(config.port, () => {
    console.log('listen ' + config.port);
    console.log('RUN HTTP SERVER');
  });
};
