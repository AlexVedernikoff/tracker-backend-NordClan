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

	let includeForCount = {
			model: Tag,
			as: 'tagForQuery',
			required: true,
			attributes: [],
			where: {
				name: {
					$or: req.query.tags ? req.query.tags.split(',').map((el) => el.trim()) : [],
				},
			},
			through: {
				model: ItemTag,
				attributes: []
			}
		};

	let includeForQuery = {
		model: Tag,
		attributes: ['name'],
		through: {
			model: ItemTag,
			attributes: []
		}
	};


	Project
		.findAll({
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ? [includeForCount, includeForQuery] : [includeForQuery],
			subQuery: true,
		})
		.then(projects => {

			Project
				.count({
					include: req.query.tags ? [includeForCount] : [],
					group: ['Project.id']
				})
				.then((count) => {

					count = count.length;

					let projectsRows = projects ?
						projects.map(
							item =>
								item.dataValues
						) : [];

					let responseObject = {
						currentPage: req.query.currentPage ? +req.query.currentPage : 1,
						pagesCount: Math.ceil(count / (req.query.pageSize ? req.query.pageSize : 1)),
						pageSize: req.query.pageSize ? +req.query.pageSize : +count,
						rowsCountAll: count,
						rowsCountOnCurrentPage: projectsRows.length,
						data: projectsRows
					};
					res.end(JSON.stringify(responseObject));

				})
				.catch((err) => {
					next(err);
				});


		})
		.catch((err) => {
			next(err);
		});
};
