const createError = require('http-errors');
const Portfolio = require('../models/Portfolio');


exports.create = function(req, res, next){

	Portfolio.create(req.body)
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(createError(err));
		});

};


exports.read = function(req, res, next){

	Portfolio.findByPrimary(req.params.id)
		.then((portfolio) => {
			if(!portfolio) { return next(createError(404)); }

			res.end(JSON.stringify(portfolio.dataValues));
		})
		.catch((err) => {
			next(err);
		});

};


exports.update = function(req, res, next){

	Portfolio.findByPrimary(req.params.id)
		.then((portfolio) => {
			if(!portfolio) { return next(createError(404)); }


			portfolio.updateAttributes(req.body)
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

	Portfolio.findByPrimary(req.params.id)
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
		limit: req.query.limit ? req.query.limit : 10,
		offset: req.query.limit && req.query.page ? +req.query.limit * +req.query.page : 0,
	})
		.then(portfolio => {
			portfolio = portfolio.rows ?
				portfolio.rows.map(
					item =>
						item.dataValues
				) : [];

			res.end(JSON.stringify(portfolio));
		})
		.catch((err) => {
			next(err);
		});
};

exports.syncForce = function(req, res, next) {
	Portfolio.sync({force: true})
		.then(() => {
			res.end();
		})
		.catch((err) => {
			next(err);
		});
};
