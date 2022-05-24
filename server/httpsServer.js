const express = require('express');
const fs = require('fs');
const app = express();
const config = require('./configs');
const swagger = require('swagger-express');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const { routes } = require('./routers/index');
const errorHandlerMiddleWare = require('./middlewares/ErrorHandlerMiddleWare');
const HealthcheckController = require('./controllers/api/v1/HealthcheckController');
const FeatureFlagsController = require('./controllers/api/v1/FeatureFlags');

const httpsServer = require('https');

exports.runHttpsServer = function () {
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

  if (process.env.TRACELOGS) {
    const morganBody = require('morgan-body');

    morganBody(app, {
      logReqUserAgent: false,
      logIP: false,
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

  const options = {
    key: fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.key')),
    cert: fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.crt')),
    requestCert: true,
    rejectUnauthorized: false,
    ca: [
      fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.crt')),
    ],
    passphrase: 'Aa1234', // todo move to env (??)
  };

  // todo just for testing
  app.get('/test', (req, res) => {
    const cert = req.socket.getPeerCertificate();

    if (req.client.authorized) {
      res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`);
    } else if (cert.subject) {
      res.status(403)
        .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`);
    } else {
      res.status(401)
        .send('Sorry, but you need to provide a client certificate to continue.');
    }
  });

  httpsServer.createServer(options, app).listen(config.httpsPort, () => {
    console.log('listen ' + config.httpsPort);
  });
};
