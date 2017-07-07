const createError = require('http-errors');
const models = require('../models');

exports.list = function(req, res, next){

	req.checkParams('taggable', 'taggable must be \'task\' or \'sprint\' or \'project\'' ).isIn(['task', 'sprint', 'project']);
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

	req.checkBody('taggable', 'taggable must be \'task\' or \'sprint\' or \'project\'' ).isIn(['task', 'sprint', 'project']);
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

			let promises = [];

			return models[firstLetterUp(req.body.taggable)]
				.findByPrimary(req.body.taggableId, { attributes: ['id'] })
				.then((Model) => {
					if(!Model) return next(createError(404, 'taggable model not found'));

						models.Tag
							.findOrCreate({where: {name: req.body.tag.trim()}})
							.spread((tag, created) => {

								return Model
									.addTag(tag)
									.catch((err) => next(createError(err)));
							})
							.then(() => {
								// Возвращаю массив тегов
								return models[firstLetterUp(req.body.taggable)]
									.findByPrimary(req.body.taggableId, {
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
							.catch((err) => next(createError(err)))

				})
				.catch((err) => next(createError(err)));


		});
};

exports.delete = function(req, res, next){

	req.checkParams('taggable', 'taggable must be \'task\' or \'sprint\' or \'project\'' ).isIn(['task', 'sprint', 'project']);
	req.checkParams('id', 'taggableId must be int').isInt();
	req.checkQuery('tag', 'tab must be more then 2 chars').isLength({min: 2});

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


// Обработчик тегов при создании записи проекта, задачи, спринта
exports.tagsHandlerForModel = function(Model, req, res, next) {
	let tags = false;
	extractTags();
	if(tags) {

		tags.forEach(function(itemTag) {

			models.Tag
				.findOrCreate({where: {name: itemTag.trim()}})
				.spread((tag, created) => {

					Model
						.addTag(tag)
						.then(() => res.end(JSON.stringify({id: Model.dataValues.id})))
						.catch((err) => next(createError(err)));
				})
				.catch((err) => next(createError(err)));

		});

	} else {
		res.end(JSON.stringify({id: Model.dataValues.id}));
	}

	function extractTags() {
		if('tags' in req.body && req.body.tags) {
			tags = req.body.tags.toString().split(',');
		}
	}
};


function firstLetterUp(value) {
	return value[0].toUpperCase() + value.substring(1);
}