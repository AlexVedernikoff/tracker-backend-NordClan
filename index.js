const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const sequelize = require('./orm');
const ProjectController = require('./controllers/Project');


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.post('/project/', ProjectController.create);
app.get('/project/:id', ProjectController.read);
app.put('/project/:id', ProjectController.update);
app.del('/project/:id', ProjectController.delete)
app.get('/projects', ProjectController.list);

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

module.exports = app;