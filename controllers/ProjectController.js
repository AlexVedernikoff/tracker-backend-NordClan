const createError = require('http-errors');
const moment = require('moment');
const _ = require('underscore');
const TagController = require('./TagController');
const Project = require('../models').Project;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const Portfolio = require('../models').Portfolio;
const Sprint = require('../models').Sprint;
const queries = require('../models/queries');


exports.create = function(req, res, next){

	Project.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Project
		.create(req.body)
		.then((model) => {
			return queries.tag.saveTagsForModel(model, req.body.tags)
				.then(() => {
					if(!req.body.portfolioId && req.body.portfolioName) return queries.project.savePortfolioToProject(model, req.body.portfolioName);
				})
				.then(() => res.end(JSON.stringify({id: model.id})));
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
					as: 'sprints',
					model: Sprint,
					attributes: ['id', 'name', 'factStartDate', 'factFinishDate', 'statusId'],
					order: [
						['factStartDate', 'DESC'],
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

	Project
		.findByPrimary(req.params.id, { attributes: ['id'] })
		.then((project) => {
			if(!project) { return next(createError(404)); }

			// сброс портфеля
			if (req.body.portfolioId == 0) req.body.portfolioId = null;

			project
				.updateAttributes(req.body)
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
	let queryIncludes = [];

	where.deletedAt = {$eq: null }; // IS NULL

	if(req.query.name) {
		where.name = { $iLike: "%" + req.query.name + "%" };
	}
	if(req.query.statusId) {
		where.statusId = req.query.statusId;
	}

	// вывод текущего спринта
	queryIncludes.push({
		as: 'currentSprints',
		model: Sprint,
		attributes: ['name', 'factStartDate', 'factFinishDate', 'id', 'projectId'],
		limit: 1,
		order: [
			['factStartDate', 'DESC'],
		],
		where: {
			factStartDate: {
				$lte: moment().format('YYYY-MM-DD') // factStartDate <= now
			},
			factFinishDate: {
				$gte: moment().format('YYYY-MM-DD') // factFinishDate >= now
			},
			deletedAt: {
				$eq: null // IS NULL
			}
		},
		separate: true
	});

	// вывод тегов
	queryIncludes.push({
		model: ItemTag,
		as: 'itemTag',
		where: {
			taggable: 'project'
		},
		separate: true,
		include: [{
			as: 'tag',
			model: Tag,
			attributes: ['name'],
		}],
	});

	// Порфтель
	queryIncludes.push({
		as: 'portfolio',
		model: Portfolio,
		attributes: ['name']
	});


	// Фильтрация по дате
	let queryFactStartDate = {};
	let queryFactFinishDate = {};

	if(req.query.dateSprintBegin) {
		queryFactStartDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
		queryFactFinishDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
	}

	if(req.query.dateSprintEnd) {
		queryFactStartDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
		queryFactFinishDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
	}

	if(req.query.dateSprintBegin || req.query.dateSprintEnd) {
		queryIncludes.push({
			as: 'sprintForQuery',
			model: Sprint,
			attributes: [],
			where: {
				$or: [
					{
						factStartDate: queryFactStartDate
					},
					{
						factFinishDate: queryFactFinishDate
					}
				]

			}
		});
	}


	Promise.resolve()
		// Фильтрация по тегам ищем id тегов
		.then(() => {
			if(req.query.tags) {
				return Tag
					.findAll({
						where: {
							name: {
								$or: req.query.tags.split(',').map((el) => el.trim())
							}
						}
					});
			}
		})
		// Включаем фильтрация по тегам в запрос
		.then((tags) => {
			if(tags) {
				queryIncludes.push({
					model: ItemTag,
					as: 'itemTag',
					required: true,
					attributes: [],
					where: {
						tag_id: {
							$or: tags.map(el => el.dataValues.id),
						},
					},
				});
			}
		})
		.then(() => {
			return Project
				.findAll({
					attributes: req.query.fields ? _.union(['id','portfolioId','name','statusId', 'createdAt'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
					limit: req.query.pageSize ? +req.query.pageSize : 1000,
					offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
					include: queryIncludes,
					where: where,
					order: [
						['statusId', 'DESC'],
						['createdAt', 'DESC'],
					],
					subQuery: true,
				})
				.then(projects => {

					return Project
						.count({
							include: queryIncludes,
							where: where,
							group: ['Project.id']
						})
						.then((count) => {
							count = count.length;


							if(projects) {
								for (key in projects) {
									let row = projects[key].dataValues;
									if(row.itemTag) row.tags = Object.keys(row.itemTag).map((k) => row.itemTag[k].tag.name); // Преобразую теги в массив
									row.elemType = 'project';
									delete row.itemTag;


									if(row.portfolioId === null) {
										resultProjects['project-' + row.id] = row;
									} else {

										if(!resultProjects['portfolio-' + row.portfolioId]) {
											resultProjects['portfolio-' + row.portfolioId] = {
												elemType: 'portfolio',
												id: row.portfolioId,
												name: row.portfolio.name,
												data: []
											}
										}

										resultProjects['portfolio-' + row.portfolioId].data.push(row);

									}

								}
							}


							let responseObject = {
								currentPage: req.query.currentPage ? +req.query.currentPage : 1,
								pagesCount: Math.ceil(count / (req.query.pageSize ? req.query.pageSize : 1)),
								pageSize: req.query.pageSize ? +req.query.pageSize : +count,
								rowsCountAll: count,
								rowsCountOnCurrentPage: projects.length,
								data: Object.keys(resultProjects).map((k) => resultProjects[k])
							};
							res.end(JSON.stringify(responseObject));

						})
						.catch((err) => {
							next(err);
						});


				})
		})
		.catch((err) => {
			next(err);
		});


};
