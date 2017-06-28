const createError = require('http-errors');
const TagController = require('./TagController');
const Project = require('../models').Project;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const Portfolio = require('../models').Portfolio;


exports.create = function(req, res, next){

	Project.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Project
		.create(req.body)
		.then((model) => {
			TagController.tagsHandlerForModel(model, req, res, next);
		})
		.catch((err) => {
			next(err);
		});

};


exports.read = function(req, res, next){

	Project
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
		.then((model) => {
			if(!model) { return next(createError(404)); }

			res.end(JSON.stringify(model.dataValues));
		})
		.catch((err) => {
			next(err);
	});

};


exports.update = function(req, res, next){

	Project
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((project) => {
			if(!project) { return next(createError(404)); }


			project
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

	Project.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((project) => {
			if(!project) { return next(createError(404)); }

			project.destroy()
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
	let resultProjects = {};

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

	let data = [
		{
			"id": 1,
			"name": "My name",
			"portfolioId": null,
			"elemType": "project",
		},
		{
			"id": 2,
			"name": "My name",
			"portfolioId": null,
			"elemType": "project",
		},
		{
			"elemType": "portfolio",
			"id": "12",
			"name": "My name",
			"data": [
				{
					"id": 1,
					"name": "My name",
					"portfolioId": 12,
					"elemType": "project",
				},
			]
		}
	];


	Project
		.findAll({
			limit: req.query.pageSize ? +req.query.pageSize : 1000,
			offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
			include: req.query.tags ?
				[
					includeForCount,
					includeForQuery
				] :
				[
					includeForQuery,
					{
						model: Portfolio,
						attributes: ['name']
					}
			],
			where: where,
			subQuery: true,
		})
		.then(projects => {

			Project
				.count({
					include: req.query.tags ? [includeForCount] : [],
					where: where,
					group: ['Project.id']
				})
				.then((count) => {
					count = count.length;


					if(projects) {
						for (key in projects) {
							let row = projects[key].dataValues;
							row.elemType = 'project';

							if(row.portfolioId === null) {
								resultProjects['project-' + row.id] = row;
							} else {

								if(!resultProjects['portfolio-' + row.portfolioId]) {
									resultProjects['portfolio-' + row.portfolioId] = {
										elemType: 'portfolio',
										id: row.portfolioId,
										name: row.Portfolio.name,
										data: {}
									}
								}

								resultProjects['portfolio-' + row.portfolioId].data['project-' + row.id] = row;

							}

						}
					}


					let responseObject = {
						currentPage: req.query.currentPage ? +req.query.currentPage : 1,
						pagesCount: Math.ceil(count / (req.query.pageSize ? req.query.pageSize : 1)),
						pageSize: req.query.pageSize ? +req.query.pageSize : +count,
						rowsCountAll: count,
						rowsCountOnCurrentPage: projects.length,
						data: resultProjects
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
