const createError = require('http-errors');
const ProjectModel = require('../models/Project');
const BaseController = require('./BaseController');

exports.create = function(req, res, next){

	ProjectModel.model.create(new ProjectModel(req.body).getAttributes())
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(createError(err));
	});

};


exports.read = function(req, res, next){

	ProjectModel.model.findById(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }

			res.end(JSON.stringify(project.dataValues));
		})
		.catch((err) => {
			next(createError(err));
	});

};


exports.update = function(req, res, next){

	ProjectModel.model.findById(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }


			project.updateAttributes(new ProjectModel(req.body).getAttributes())
				.then(()=>{
					res.end();
				})
				.catch((err) => {
					next(createError(err));
				});

		})
		.catch((err) => {
			next(createError(err));
		});

};


exports.delete = function(req, res, next){

	ProjectModel.model.findById(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }

			project.destroy()
				.then(()=>{
					res.end();
				})
				.catch((err) => {
					next(createError(err));
			});

		})
		.catch((err) => {
			next(createError(err));
	});

};


exports.list = function(req, res, next){

	ProjectModel.model.findAndCountAll({
			limit: req.query.limit ? req.query.limit : 10,
			offset: req.query.limit && req.query.page ? +req.query.limit * +req.query.page : 0,
		})
		.then(projects => {
			projects = projects.rows ?
				projects.rows.map(
					item =>
						item.dataValues
				) : [];

			res.end(JSON.stringify(projects));
		})
		.catch((err) => {
			next(createError(err));
		});
};


exports.syncForce = function(req, res, next) {
	ProjectModel.model.sync({force: true})
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(createError(err));
		});
};
