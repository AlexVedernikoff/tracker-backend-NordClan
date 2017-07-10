const createError = require('http-errors');
const _ = require('underscore');
const TagController = require('./TagController');
const Portfolio = require('../models').Portfolio;
const Tag = require('../models').Tag;

exports.create = function(req, res, next){

	Portfolio.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Portfolio.create(req.body)
		.then((model) => {
			res.end(JSON.stringify({id: model.id}));
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
				.then((model)=> res.end(JSON.stringify({id: model.dataValues.id})))
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

	let where = {};
	where.deletedAt = {$eq: null }; // IS NULL

	if(req.query.name) {
		where.name = {
			$iLike: "%" + req.query.name + "%"
		}
	}

	Portfolio
		.findAll({
			attributes: req.query.fields ? _.union(['id','name'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			where: where,
			subQuery: true,
		})
		.then(projects => {

			Portfolio
				.count({
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
