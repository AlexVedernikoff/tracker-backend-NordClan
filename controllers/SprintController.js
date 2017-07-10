const createError = require('http-errors');
const _ = require('underscore');
const TagController = require('./TagController');
const Sprint = require('../models').Sprint;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const queries = require('../models/queries');


exports.create = function(req, res, next){

	Sprint.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Sprint.create(req.body)
		.then((model) => {
			return queries.tag.saveTagsForModel(model, req.body.tags)
				.then(() => {
					return queries.sprint.allSprintsByProject(model.projectId)
						.then((sprints) => {
							res.end(JSON.stringify({id: model.id, sprints: sprints}));
						});
				});
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Sprint.findByPrimary(req.params.id, {
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
	Sprint.findByPrimary(req.params.id, { attributes: ['id', 'projectId'] })
		.then((model) => {
			if(!model) { return next(createError(404)); }

			return model.updateAttributes(req.body)
				.then((model)=>{
					return queries.sprint.allSprintsByProject(model.projectId)
						.then((sprints) => {
							res.end(JSON.stringify(sprints));
						});
				})
		})
		.catch((err) => {
			next(err);
		});

};


exports.delete = function(req, res, next){

	Sprint.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((model) => {
			if(!model) { return next(createError(404)); }

			return model.destroy()
				.then(()=>{
					return queries.sprint.allSprintsByProject(model.projectId)
						.then((sprints) => {
							res.end(JSON.stringify(sprints));
						});
				})

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

/*

function allSprintsByProject(projectId) {
	let result = [];
	return Sprint
		.findAll({where: {projectId: projectId, deletedAt: null}, order: [['factFinishDate', 'DESC'], ['name', 'ASC']], attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate']})
		.then((model) => {
			model.forEach((elModel) => {
				result.push(elModel.dataValues);
			});
			return result;
		});
};*/
