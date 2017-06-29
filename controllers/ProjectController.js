const createError = require('http-errors');
const moment = require('moment');
const _ = require('underscore');
const TagController = require('./TagController');
const Project = require('../models').Project;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const Portfolio = require('../models').Portfolio;
const Sprint = require('../models').Sprint;


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
					as: 'tags',
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


			if(model.dataValues.tags) model.dataValues.tags = Object.keys(model.dataValues.tags).map((k) => model.dataValues.tags[k].name); // Преобразую теги в массив
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
	let queryIncludes = [];

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
			}
		}
	});

	// вывод тегов
	queryIncludes.push({
		as: 'tags',
		model: Tag,
		attributes: ['name'],
		through: {
			model: ItemTag,
			attributes: []
		}
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

	// Фильтрация по тегам
	if(req.query.tags) {
		queryIncludes.push({
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
		});
	}



	Project
		.findAll({
			attributes: req.query.fields ? _.union(['id','portfolioId','name'].concat(req.query.fields.split(',').map((el) => el.trim()))) : '',
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

			Project
				.count({
					//include: req.query.tags ? [includeForCount] : [],
					//where: where,
					group: ['Project.id']
				})
				.then((count) => {
					count = count.length;


					if(projects) {
						for (key in projects) {
							let row = projects[key].dataValues;
							if(row.tags) row.tags = Object.keys(row.tags).map((k) => row.tags[k].name); // Преобразую теги в массив
							row.elemType = 'project';


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
		.catch((err) => {
			next(err);
		});
};
