const koa = require('koa');
const logger = require('koa-logger');
const router = require('koa-router')();
const cors = require('koa-cors');
const body = require('koa-better-body');
const swagger = require('swagger-koa');
const mongoose = require('mongoose');

const config = require('./configs');

const spec = require('./spec.js');

const app = koa();

app.name = config.appName;

app.use(function *(next) {
  try {
    yield next;
  } catch (e) {
    if (e.status || e.statusCode || e.code) {
      this.status = e.status || e.statusCode || e.code;
      this.body = e.stack;
    }
    console.error(e);
  }
});

app.use(logger());
app.use(cors());
app.use(body());
app.use(swagger.init({
  swaggerVersion: '2.0',
  swaggerURL: '/swagger',
  swaggerUI: './public/swagger/',
  basePath: '/api',
}));

app.use(function *(next) {
  let start = new Date;
  yield next;
  let ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  this.set('X-Server-Time', start.getTime());
  this.set('X-Server-Datetime', start.toUTCString());
  this.set('X-Server-Name', app.name);
});

app.use(router.get('/swagger/spec.js', function *() {
  let spec = require('./spec.js');
  this.body = spec;
}).routes());

app.use(require('./controllers').routes());
app.use(router.use('/api', require('./controllers').routes()).routes());

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

app.listen(config.port);

let db = mongoose.connection;
if (!mongoose.connection.readyState) {
  mongoose.connect('mongodb://' + config.db.mongodb.host + '/' + config.db.mongodb.name);
  db.on('error', err => console.error('Mongoose connection error:', err));
}
