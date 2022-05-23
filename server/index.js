const { runHttpServer } = require('./httpServer');
const { runHttpsServer } = require('./httpsServer');

exports.run = function () {
  runHttpServer();
  runHttpsServer();
};
