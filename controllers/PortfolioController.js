const createError = require('http-errors');
const TagController = require('./TagController');
const Portfolio = require('../models').Portfolio;


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

	Portfolio.findAndCountAll({
		limit: req.query.pageSize ? req.query.pageSize : 10,
		offset: req.query.pageSize && req.query.page ? +req.query.pageSize * +req.query.page : 0,
	})
		.then(portfolio => {

			req.query.currentPage = req.query.currentPage ? req.query.currentPage : 1;
			req.query.pageSize = req.query.pageSize ? req.query.pageSize : portfolio.count;


			let projectsRows = portfolio.rows ?
				portfolio.rows.map(
					item =>
						item.dataValues
				) : [];


			let responseObject = {
				currentPage: req.query.currentPage,
				pagesCount: Math.ceil(portfolio.count / req.query.pageSize),
				pageSize: req.query.pageSize,
				rowsCountAll: portfolio.count,
				rowsCountOnCurrentPage: projectsRows.length,
				data: projectsRows
			};

			res.end(JSON.stringify(responseObject));
		})
		.catch((err) => {
			next(err);
		});
};
