const express = require('express');
const swagger = require('swagger-express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const errorHandler = require('./models/HttpError');
const routes = require('./controllers/index');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.all('*', function(req, res, next){
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache');
	next();
});


app.use(swagger.init(app, {
	apiVersion: '1.0',
	swaggerVersion: '2.0',
	swaggerURL: '/',
	swaggerUI: './public/swagger/',
	basePath: '/api',
}));

app.get('/swagger/spec.js', function(req, res) {
	res.send(require('./spec.js'));
});


app.use('/api', routes);
app.use(errorHandler());


sequelize
	.authenticate()
  .then((err) => {
		 console.log('Database connection has been established successfully.');
	}, function (err) {
		console.log('Unable to connect to the database:', err);
	});


app.listen(3000, () => {
	console.log('listen 3000');
});

