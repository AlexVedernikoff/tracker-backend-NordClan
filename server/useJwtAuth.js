const checkTokenMiddleWare = require('./middlewares/CheckTokenMiddleWare').checkToken;
const checkSystemTokenMiddleWare = require('./middlewares/CheckSystemTokenMiddleWare').checkToken;
const Access = require('./middlewares/Access/SetUserAccessMiddleWare');
const { getUserByToken } = require('./middlewares/CheckTokenMiddleWare');

exports.useJwtAuth = function (app, server) {
  const io = require('socket.io')(server, {
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

  app.use(function (req, res, next) {
    res.io = io;
    next();
  });

  app.use(checkTokenMiddleWare);
  app.use(checkSystemTokenMiddleWare);
  app.use(Access.middleware);
};
