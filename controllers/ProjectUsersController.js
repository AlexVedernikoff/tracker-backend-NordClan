const createError = require('http-errors');
const models = require('../models');

exports.create = function(req, res, next){
	models.ProjectUsers.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	models.ProjectUsers
		.findOrCreate({where: req.body})
		.then((ProjectUsers) => {
			conosle.log(ProjectUsers);

		})
		.catch((err) => {
			next(err);
		});
};


exports.delete = function(req, res, next){

};