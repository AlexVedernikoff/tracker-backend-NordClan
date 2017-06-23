const createError = require('http-errors');
const Sprint = require('../models').Sprint;


exports.create = function(req, res, next){

	Sprint.create(req.body)
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Sprint.findByPrimary(req.params.id)
		.then((row) => {
			if(!row) { return next(createError(404)); }

			res.end(JSON.stringify(row.dataValues));
		})
		.catch((err) => {
			next(err);
		});

};


exports.update = function(req, res, next){

	Sprint.findByPrimary(req.params.id)
		.then((row) => {
			if(!row) { return next(createError(404)); }


			row.updateAttributes(req.body)
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

	Sprint.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((row) => {
			if(!row) { return next(createError(404)); }

			row.destroy()
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


	Sprint.findAndCountAll({
		limit: req.query.pageSize ? req.query.pageSize : 10,
		offset: req.query.pageSize && req.query.page ? +req.query.pageSize * +req.query.page : 0,
	})
		.then(sprints => {

			req.query.currentPage = req.query.currentPage ? req.query.currentPage : 1;
			req.query.pageSize = req.query.pageSize ? req.query.pageSize : sprints.count;


			let projectsRows = sprints.rows ?
				sprints.rows.map(
					item =>
						item.dataValues
				) : [];


			let responseObject = {
				currentPage: req.query.currentPage,
				pagesCount: Math.ceil(sprints.count / req.query.pageSize),
				pageSize: req.query.pageSize,
				rowsCountAll: sprints.count,
				rowsCountOnCurrentPage: projectsRows.length,
				data: projectsRows
			};

			res.end(JSON.stringify(responseObject));
		})
		.catch((err) => {
			next(err);
		});
};

