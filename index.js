const express = require('express');
const swagger = require('swagger-express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const errorHandler = require('./components/HttpError');
const routes = require('./controllers/index');
const checkTokenMiddleWare = require('./components/Auth').checkTokenMiddleWare;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/api/swagger/spec.js', function(req, res) {
	res.send(require('./spec.js'));
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
	next();
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


app.listen(8080, () => {
	console.log('listen 8080');
});

