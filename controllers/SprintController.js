const createError = require('http-errors');
const _ = require('underscore');
const Sprint = require('../models').Sprint;
const queries = require('../models/queries');


exports.create = function(req, res, next){

	Sprint.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Sprint.create(req.body)
		.then((model) => {
			return queries.sprint.allSprintsByProject(model.projectId)
				.then((sprints) => {
					res.end(JSON.stringify({id: model.id, sprints: sprints}));
				});
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Sprint.findByPrimary(req.params.id, {
	})
		.then((model) => {
			if(!model) { return next(createError(404)); }
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

	Sprint.findByPrimary(req.params.id, { attributes: ['id', 'projectId'] })
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
	where.deletedAt = {$eq: null }; // IS NULL

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
			where: where,
			order: [['factFinishDate', 'DESC'], ['name', 'ASC']],
			subQuery: true,
		})
		.then(projects => {

			Sprint
				.count({
					where: where,
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


exports.setStatus = function(req, res, next){
	if(!req.params.id) return next(createError(400, 'sprintId need'));
	if(!req.body.statusId) return next(createError(400, 'statusId need'));
	if(!req.body.statusId.match(/^[0-9]+$/)) return next(createError(400, 'statusId must be integer'));

	Sprint
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((sprint) => {
			if(!sprint) { return next(createError(404)); }

			return sprint
				.updateAttributes({
					statusId: req.body.statusId
				})
				.then((model)=>{
					res.end(JSON.stringify({
						id: model.id,
						statusId: model.statusId
					}));
				})
		})
		.catch((err) => {
			next(err);
		});
};
