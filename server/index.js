const express = require('express');
const app = express();
const config = require('./configs');
const swagger = require('swagger-express');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const { routes } = require('./routers/index');
const checkTokenMiddleWare = require('./middlewares/CheckTokenMiddleWare').checkToken;
const getUserByToken = require('./middlewares/CheckTokenMiddleWare').getUserByToken;
const checkSystemTokenMiddleWare = require('./middlewares/CheckSystemTokenMiddleWare').checkToken;
const errorHandlerMiddleWare = require('./middlewares/ErrorHandlerMiddleWare');
const Access = require('./middlewares/Access/SetUserAccessMiddleWare');
const server = require('http').Server(app);
const HealthcheckController = require('./controllers/api/v1/HealthcheckController');
const FeatureFlagsController = require('./controllers/api/v1/FeatureFlags');
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

exports.run = function () {
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(bodyParser.json());
  app.use(expressValidator());
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get('/api/v1/core/featureFlags', FeatureFlagsController.get);
  app.post('/api/v1/core/featureFlags', FeatureFlagsController.set);
  app.get('/api/v1/healthcheck', HealthcheckController.healthcheck);
  app.get('/api/v1/swagger/spec.js', function (req, res) {
    res.send(require('../swaggerSpec.js'));
  });

  app.use(
    swagger.init(app, {
      apiVersion: '1.0',
      swaggerVersion: '2.0',
      swaggerURL: '/api/v1/swagger',
      swaggerUI: './public/swagger/',
      basePath: '/api/v1/swagger',
    })
  );

  app.use(checkTokenMiddleWare);
  app.use(checkSystemTokenMiddleWare);
  app.use(Access.middleware);

  if (process.env.TRACELOGS) {
    const morganBody = require('morgan-body');

    morganBody(app, {
      logReqUserAgent: false,
      logIP: false
    });
  }

  app.all('*', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ? req.headers.origin : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });

  app.use(function (req, res, next) {
    res.io = io;
    next();
  });

  app.use('/api/v1', routes);
  app.use(errorHandlerMiddleWare);

  app.get('*', function (req, res) {
    res.status(404).json({
      status: 404,
      message: 'Page Not Found',
      name: 'NotFoundError',
    });
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

  server.listen(config.port, () => {
    console.log('listen ' + config.port);
  });
};
