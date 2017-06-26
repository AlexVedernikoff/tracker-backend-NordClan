const createError = require('http-errors');
const TagController = require('./TagController');
const Project = require('../models').Project;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;


exports.create = function(req, res, next){

	Project
		.create(req.body)
		.then((model) => {
			TagController.tagsHandlerForModel(model, req, res, next);
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Project
		.findByPrimary(req.params.id, {
			include: [
				{
					model: Tag,
					attributes: ['name'],
					through: {
						attributes: []
					}
				}
			]
		})
		.then((model) => {
			if(!model) { return next(createError(404)); }

			res.end(JSON.stringify(model.dataValues));
		})
		.catch((err) => {
			next(err);
	});

};


exports.update = function(req, res, next){

	Project
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((project) => {
			if(!project) { return next(createError(404)); }


			project
				.updateAttributes(req.body)
				.then((model)=>{
					TagController.tagsHandlerForModel(model, req, res, next);
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

	Project.findByPrimary(req.params.id, { attributes: ['id'] })
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
