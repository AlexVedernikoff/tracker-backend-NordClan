const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const User = require('../models/User');
const Department = require('../models/Department');
const UserDepartments = require('../models/UserDepartments');
const UserTokens = require('../models/Token');

const Models  = [
	Portfolio,
	Project,
	Sprint,
	Task,
	User,
	Department,
	UserDepartments,
	UserTokens,
];


(() => {
	let chain = Promise.resolve();
	Models.forEach(function(Model) {
		chain = chain
			.then(() => Model.sync({force: true}))
	});


	chain
		.then(() => {
			console.info('Done');
		})
		.catch((err) => {
			console.error(err);
		});
})();