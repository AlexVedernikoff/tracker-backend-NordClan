const createError = require('http-errors');
const TagController = require('./TagController');
const Portfolio = require('../models').Portfolio;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;


exports.create = function(req, res, next){

	Portfolio.create(req.body)
		.then((model) => {
			TagController.tagsHandlerForModel(model, req, res, next);
		})
		.catch((err) => {
			next(createError(err));
		});

};


exports.read = function(req, res, next){

	Portfolio
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
		.then((portfolio) => {
			if(!portfolio) { return next(createError(404)); }

			res.end(JSON.stringify(portfolio.dataValues));
		})
		.catch((err) => {
			next(err);
		});

};


exports.update = function(req, res, next){

	Portfolio
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((portfolio) => {
			if(!portfolio) { return next(createError(404)); }


			portfolio
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

	Portfolio
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((portfolio) => {
			if(!portfolio) { return next(createError(404)); }

			portfolio.destroy()
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


	Portfolio
		.findAll({
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ? [includeForCount, includeForQuery] : [includeForQuery],
			subQuery: true,
		})
		.then(projects => {

			Portfolio
				.count({
					include: req.query.tags ? [includeForCount] : [],
					group: ['Portfolio.id']
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
