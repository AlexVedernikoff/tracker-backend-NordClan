const express = require('express');
const app = express();
const config = require('./configs');
const swagger = require('swagger-express');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const routes = require('./routers/index');
const checkTokenMiddleWare = require('./middlewares/CheckTokenMiddleWare').checkToken;
const errorHandlerMiddleWare = require('./middlewares/ErrorHandlerMiddleWare');

exports.run = function() {
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(expressValidator());
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: false}));
  
  app.get('/api/swagger/spec.js', function(req, res) {
    res.send(require('../swaggerSpec.js'));
  });
  
  app.use(swagger.init(app, {
    apiVersion: '1.0',
    swaggerVersion: '2.0',
    swaggerURL: '/api/swagger',
    swaggerUI: './public/swagger/',
    basePath: '/api/swagger',
  }));
  
  app.use(checkTokenMiddleWare);
  
  app.all('*', function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin? req.headers.origin: '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });
  
  app.use('/api', routes);
  app.use(errorHandlerMiddleWare);
  
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    }, function (err) {
      console.log('Unable to connect to the database:', err);
    });
  
  app.listen(config.port, () => {
    console.log('listen ' + config.port );
  });
  
};

