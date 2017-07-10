const createError = require('http-errors');
const _ = require('underscore');
const TagController = require('./TagController');
const Task = require('../models').Task;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;


exports.create = function(req, res, next){

	Task.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Task.create(req.body)
		.then((model) => {
			return queries.tag.saveTagsForModel(model, req.body.tags)
				.then(() => res.end(JSON.stringify({id: model.id})));
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Task.findByPrimary(req.params.id, {
		include: [
			{
				as: 'tags',
				model: Tag,
				attributes: ['name'],
				through: {
					model: ItemTag,
					attributes: []
				},
				order: [
					['name', 'ASC'],
				],
			}
		]
	})
		.then((model) => {
			if(!model) { return next(createError(404)); }

			if(model.dataValues.tags) model.dataValues.tags = Object.keys(model.dataValues.tags).map((k) => model.dataValues.tags[k].name); // Преобразую теги в массив
			res.end(JSON.stringify(model.dataValues));
		})
		.catch((err) => {
			next(err);
		});

};


exports.update = function(req, res, next){
	let resultRespons = {};

	Task.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((row) => {
			if(!row) { return next(createError(404)); }


			row.updateAttributes(req.body)
				.then((model)=>{

					resultRespons.id = model.id;
					// Получаю измененные поля
					_.keys(model.dataValues).forEach((key) => {
						if(req.body[key])
							resultRespons[key] = model.dataValues[key];
					});

					res.end(JSON.stringify(resultRespons));

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

	Task.findByPrimary(req.params.id, { attributes: ['id'] })
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
		as: 'tags',
		model: Tag,
		attributes: ['name'],
		through: {
			model: ItemTag,
			attributes: []
		},
		order: [
			['name', 'ASC'],
		],
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

	if(req.query.sprintId) {
		where.sprintId = req.query.sprintId;
	}

	Task
		.findAll({
			attributes: req.query.fields ? _.union(['id','name'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ? [includeForCount, includeForQuery] : [includeForQuery],
			where: where,
			subQuery: true,
		})
		.then(projects => {

			Task
				.count({
					include: req.query.tags ? [includeForCount] : [],
					group: ['Task.id']
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
