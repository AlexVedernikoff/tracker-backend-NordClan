const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./orm');
const routes = require('./controllers/index');


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.all('*', function(req, res, next){
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache');
	next();
});


app.use('/', routes);


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

