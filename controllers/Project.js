const createError = require('http-errors');
const ProjectModel = require('../models/Project');


exports.create = function(req, res, next){

	ProjectModel.create(req.body)
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	ProjectModel.findByPrimary(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }

			res.end(JSON.stringify(project.dataValues));
		})
		.catch((err) => {
			next(err);
	});

};


exports.update = function(req, res, next){

	ProjectModel.findByPrimary(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }


			project.updateAttributes(req.body)
				.then(()=>{
					res.end();
				})
				.catch((err) => {
					next(err);
				});

		})
		.catch((err) => {
			next(err);
		});

};


exports.delete = function(req, res, next){

	ProjectModel.findByPrimary(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }

			project.destroy()
				.then(()=>{
					res.end();
				})
				.catch((err) => {
					next(err);
			});

		})
		.catch((err) => {
			next(err);
	});

};


exports.list = function(req, res, next){

	ProjectModel.findAndCountAll({
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
			next(err);
		});
};


exports.syncForce = function(req, res, next) {
	ProjectModel.model.sync({force: true})
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});
};
