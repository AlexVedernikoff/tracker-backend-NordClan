const createError = require('http-errors');
const _ = require('underscore');
const TagController = require('./TagController');
const Sprint = require('../models').Sprint;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;


exports.create = function(req, res, next){

	Sprint.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

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

	let where = {};

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

	if(req.query.name) {
		where.name = {
			$iLike: "%" + req.query.name + "%"
		}
	}
	if(req.query.statusId) {
		where.statusId = req.query.statusId;
	}
	if(req.query.projectId) {
		where.projectId = req.query.projectId;
	}

	Sprint
		.findAll({
			attributes: req.query.fields ? _.union(['id','name'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ? [includeForCount, includeForQuery] : [includeForQuery],
			where: where,
			subQuery: true,
		})
		.then(projects => {

			Sprint
				.count({
					include: req.query.tags ? [includeForCount] : [],
					group: ['Sprint.id']
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

