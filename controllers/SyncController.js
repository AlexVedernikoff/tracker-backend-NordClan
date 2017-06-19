const ldap = require('ldapjs');
const createError = require('http-errors');
const os = require('os');

const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const User = require('../models/User');
const Department = require('../models/Department');
const UserDepartments = require('../models/UserDepartments');

const Models  = [
	Portfolio,
	Project,
	Sprint,
	Task,
	User,
	Department,
	UserDepartments,
];

exports.syncForce = function(req, res, next) {
	let chain = Promise.resolve();

	Models.forEach(function(Model) {
		chain = chain
			.then(() => Model.sync({force: true}))

	});

	chain
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});

};

