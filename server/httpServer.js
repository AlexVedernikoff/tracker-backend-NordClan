const express = require('express');
const config = require('./configs');
const { initApp } = require('./initApp');
const getUserByToken = require('./middlewares/CheckTokenMiddleWare').getUserByToken;
const { useJwtAuth } = require('./useJwtAuth');
const app = express();

const httpServer = require('http').Server(app);

const io = require('socket.io')(httpServer, {
  path: '/api/v1/socket',
});

io.sockets.on('connection', function (socket) {
  getUserByToken(socket.handshake.headers)
    .then(user => {
      if (user) {
        socket.join(`user_${user.dataValues.id}`);
      }
    })
    .catch(err => {
      console.error('Error when connection socket io. Reason: ', err);
    });
});

exports.runHttpServer = function () {
  app.use(function (req, res, next) {
    res.io = io;
    next();
  });

  initApp(app);

  useJwtAuth(app, httpServer);

  httpServer.listen(config.port, () => {
    console.log('listen ' + config.port);
    console.log('RUN HTTP SERVER');
  });
};
