const createError = require('http-errors');
const Project = require('../models/Project');


exports.create = function(req, res, next){

	Project.create(req.body)
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Project.findByPrimary(req.params.id)
		.then((project) => {
			if(!project) { return next(createError(404)); }

			res.end(JSON.stringify(project.dataValues));
		})
		.catch((err) => {
			next(err);
	});

};


exports.update = function(req, res, next){

	Project.findByPrimary(req.params.id)
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

	Project.findByPrimary(req.params.id)
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


	Project.findAndCountAll({
			limit: req.query.pageSize ? req.query.pageSize : 10,
			offset: req.query.pageSize && req.query.page ? +req.query.pageSize * +req.query.page : 0,
		})
		.then(projects => {

			req.query.currentPage = req.query.currentPage ? req.query.currentPage : 1;
			req.query.pageSize = req.query.pageSize ? req.query.pageSize : projects.count;


			let projectsRows = projects.rows ?
				projects.rows.map(
					item =>
						item.dataValues
				) : [];


			let responseObject = {
				currentPage: req.query.currentPage,
				pagesCount: Math.ceil(projects.count / req.query.pageSize),
				pageSize: req.query.pageSize,
				rowsCountAll: projects.count,
				rowsCountOnCurrentPage: projectsRows.length,
				data: projectsRows
			};

			res.end(JSON.stringify(responseObject));
		})
		.catch((err) => {
			next(err);
		});
};


exports.syncForce = function(req, res, next) {
	Project.sync({force: true})
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});
};
