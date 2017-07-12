const createError = require('http-errors');
const _ = require('underscore');
const TagController = require('./TagController');
const models = require('../models');
const Task = require('../models').Task;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const queries = require('../models/queries');


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
			},
			{
				as: 'project',
				model: models.Project,
				attributes: ['id', 'name', 'prefix']
			},
			{
				as: 'parentTask',
				model: models.Task,
				attributes: ['id', 'name']
			},
			{
				as: 'sprint',
				model: models.Sprint,
				attributes: ['id', 'name']
			},
			{
				as: 'performer',
				model: models.User,
				attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'],
				through: {
					model: models.TaskUsers,
					attributes: []
				},
			}
		]
	})
		.then((model) => {
			if(!model) { return next(createError(404)); }

			if(model.dataValues.tags) model.dataValues.tags = Object.keys(model.dataValues.tags).map((k) => model.dataValues.tags[k].name); // Преобразую теги в массив

			if(model.dataValues.performer[0]) {
				model.dataValues.performer = model.dataValues.performer[0];
			}

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
	where.deletedAt = {$eq: null }; // IS NULL

	let includePerformer = {
		as: 'performer',
		model: models.User,
		attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'],
		through: {
			model: models.TaskUsers,
			attributes: []
		},
	};

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
		if(req.query.sprintId == 0) {
			where.sprintId = {
				$eq: null
			}
		} else {
			where.sprintId = req.query.sprintId;
		}
	}

	Task
		.findAll({
			attributes: req.query.fields ? _.union(['id','name'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ? [includeForCount, includeForQuery , includePerformer] : [includeForQuery, includePerformer],
			where: where,
			subQuery: true,
		})
		.then(projects => {

			Task
				.count({
					where: where,
					include: req.query.tags ? [includeForCount] : [],
					group: ['Task.id']
				})
				.then((count) => {

					count = count.length;

					let projectsRows = projects ?
						projects.map(
							item => {
								if(item.dataValues.performer[0]) {
									item.dataValues.performer = item.dataValues.performer[0];
								}
								return item.dataValues;
							}

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
