const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const _ = require('underscore');

exports.list = function(req, res, next){

	req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
	req.checkParams('id', 'taggableId must be int').isInt();

	req
		.getValidationResult()
		.then((result) => {

			if (!result.isEmpty()) {
				let err = new Error();
				err.statusCode = 400;
				err.name = 'ValidationError';
				err.message = { errors: result.array() };
				next(err);
			}

			models[firstLetterUp(req.params.taggable)]
				.findByPrimary(req.params.id, {
					attributes: ['id'],
					include: [
						{
							as: 'tags',
							model: models.Tag,
							attributes: ['name'],
							through: {
								model: models.ItemTag,
								attributes: []
							},
							order: [
								['name', 'ASC'],
							],
						}
					],
				})
				.then((Model) => {
					if(!Model) return next(createError(404, 'taggable model not found'));
					let row = Model.dataValues;
					let result = [];
					if(row.tags){
						result = Object.keys(row.tags).map((k) => row.tags[k].name); // Преобразую теги в массив
					}

					res.end(JSON.stringify(result));

				})
				.catch((err) => next(createError(err)));

		});
};

exports.create = function(req, res, next){

	req.checkBody('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
	req.checkBody('taggableId', 'taggableId must be int').isInt();
	req.checkBody('tag', 'tab must be more then 2 chars').isLength({min: 2});

	req
		.getValidationResult()
		.then((result) => {

			if (!result.isEmpty()) {
				let err = new Error();
				err.statusCode = 400;
				err.name = 'ValidationError';
				err.message = { errors: result.array() };
				return next(err);
			}

			return models[firstLetterUp(req.body.taggable)]
				.findByPrimary(req.body.taggableId, { attributes: ['id'] })
				.then((model) => {
					if(!model) return next(createError(404, 'taggable model not found'));

					return queries.tag.saveTagsForModel(model, req.body.tag)
						.then(() => {
							return queries.tag.getAllTagsByModel(firstLetterUp(req.body.taggable), model.id)
								.then((tags) => {
									res.end(JSON.stringify(tags));
								})
						});
				})
				.catch((err) => next(createError(err)));


		});
};

exports.delete = function(req, res, next){

	req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task', 'project']);
	req.checkParams('id', 'taggableId must be int').isInt();
	req.checkQuery('tag', 'tab must be more then 1 char').isLength({min: 1});

	req
		.getValidationResult()
		.then((result) => {

			if (!result.isEmpty()) {
				let err = new Error();
				err.statusCode = 400;
				err.name = 'ValidationError';
				err.message = { errors: result.array() };
				return next(err);
			}

			models.Tag
				.find({where: {name: req.query.tag.trim()}, attributes: ['id'] })
				.then((tag) => {
					if(!tag) return next(createError(404, 'tag not found'));

					return models.ItemTag
						.findOne({ where: {
							tagId: tag.dataValues.id,
							taggableId: req.params.id,
							taggable: req.params.taggable,
						}})
						.then((item) => {
							if(!item) return next(createError(404, 'ItemTag not found'));
							item
								.destroy()
								.then(() => {

									// Возвращаю массив тегов
									return models[firstLetterUp(req.params.taggable)]
										.findByPrimary(req.params.id, {
											attributes: ['id'],
											include: [
												{
													as: 'tags',
													model: models.Tag,
													attributes: ['name'],
													through: {
														model: models.ItemTag,
														attributes: []
													},
													order: [
														['name', 'ASC'],
													],
												}
											],
										})
										.then((Model) => {
											if(!Model) return next(createError(404, 'taggable model not found'));
											let row = Model.dataValues;
											let result = [];
											if(row.tags){
												result = Object.keys(row.tags).map((k) => row.tags[k].name); // Преобразую теги в массив
											}

											res.end(JSON.stringify(result));

										})
										.catch((err) => next(createError(err)));

								})
								.catch((err) => next(createError(err)));
						})
						.catch((err) => next(createError(err)));

				})
				.catch((err) => next(createError(err)));
		});
};

exports.autocompliter = function(req, res, next){

	let resultResponse = [];

	req.checkParams('taggable', 'taggable must be \'task\' or \'project\'' ).isIn(['task',  'project']);
	req.checkQuery('tagName', 'tab must be more then 2 chars').isLength({min: 2});
	req
		.getValidationResult()
		.then((result) => {

			if (!result.isEmpty()) {
				let err = new Error();
				err.statusCode = 400;
				err.name = 'ValidationError';
				err.message = {errors: result.array()};
				return next(err);
			}

			models.ItemTag.findAll({
				where: {
					taggable: req.params.taggable
				},
				include: [
					{
						as: 'tag',
						model: models.Tag,
						where: {
							name: {
								$iLike: '%' + req.query.tagName + '%'
							},
						}
					}
				]

			})
				.then((itemTags) => {
					itemTags.forEach((itemTag) => {
						resultResponse.push(itemTag.tag.name);
					});

					res.end(JSON.stringify(_.uniq(resultResponse)));
				});

		});

};


function firstLetterUp(value) {
	return value[0].toUpperCase() + value.substring(1);
}