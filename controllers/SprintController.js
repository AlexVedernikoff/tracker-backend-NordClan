const createError = require('http-errors');
const TagController = require('./TagController');
const Sprint = require('../models').Sprint;
const Tag = require('../models').Tag;


exports.create = function(req, res, next){

	Sprint.create(req.body)
		.then((model) => {
			TagController.tagsHandlerForModel(model, req, res, next);
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Sprint.findByPrimary(req.params.id, {
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
		.then((row) => {
			if(!row) { return next(createError(404)); }

			res.end(JSON.stringify(row.dataValues));
		})
		.catch((err) => {
			next(err);
		});

};


exports.update = function(req, res, next){

	Sprint.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((row) => {
			if(!row) { return next(createError(404)); }


			row.updateAttributes(req.body)
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

	Sprint
		.findAll({
		limit: req.query.pageSize ? req.query.pageSize : 9999999999999,
		offset: req.query.pageSize && req.query.page ? +req.query.pageSize * +req.query.page : 0,
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
		.then(projects => {


			Sprint
				.count()
				.then((count) => {

					let projectsRows = projects ?
						projects.map(
							item =>
								item.dataValues
						) : [];

					let responseObject = {
						currentPage: req.query.currentPage ? req.query.currentPage : 1,
						pagesCount: Math.ceil(count / (req.query.currentPage ? req.query.currentPage : 1)),
						pageSize: req.query.pageSize ? req.query.pageSize : count,
						rowsCountAll: count,
						rowsCountOnCurrentPage: projectsRows.length,
						data: projectsRows
					};
					res.end(JSON.stringify(responseObject));

				});


		})
		.catch((err) => {
			next(err);
		});
};

