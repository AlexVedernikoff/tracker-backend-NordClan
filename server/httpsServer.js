const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const config = require('./configs');
const swagger = require('swagger-express');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const path = require('path');
const bodyParser = require('body-parser');
const { routes } = require('./routers/index');
const errorHandlerMiddleWare = require('./middlewares/ErrorHandlerMiddleWare');
const HealthcheckController = require('./controllers/api/v1/HealthcheckController');
const FeatureFlagsController = require('./controllers/api/v1/FeatureFlags');
const { checkCertMiddleware } = require('./middlewares/CheckCertMiddleware');

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

  app.use(checkCertMiddleware);

  app.use('/api/v1', routes);
  app.use(errorHandlerMiddleWare);

  app.get('*', function (_, res) {
    res.status(404).json({
      status: 404,
      message: 'Page Not Found',
      name: 'NotFoundError',
    });
  });

  try {
    console.log('CERT PATH', config.certificateKey);

    const options = {
      key: fs.readFileSync(config.certificateKey),
      cert: fs.readFileSync(config.certificateCrt),
      requestCert: true,
      rejectUnauthorized: false,
      ca: [fs.readFileSync(config.certificateCrt)],
      passphrase: config.certificatePassphrase,
    };

    https.createServer(options, app).listen(config.httpsPort, () => {
      console.log('listen ' + config.httpsPort);
    });
  } catch (err) {
    console.error(`Failed to get certificate or key: ${err.message}`);
  }
};
