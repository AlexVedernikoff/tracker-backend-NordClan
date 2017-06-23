const createError = require('http-errors');
const models = require('../models');


exports.create = function(req, res, next){

	let taggables = ['task', 'sprint', 'project', 'portfolio'];

	if(taggables.indexOf(req.body.taggble) === -1) return next(createError(400, 'Field taggble must be only ' + taggables.join(' or ') ));
	if(!(+req.body.taggableId > 0)) return next(createError(400, 'Field taggableId must be int and more then 0' ));
	if(typeof req.body.tag !== "string") return next(createError(400, 'Field tag must be string' ));

	req.body.taggble = req.body.taggble[0].toUpperCase() + req.body.taggble.substring(1); // Do first latter uppercase

	models[req.body.taggble]
		.findByPrimary(req.body.taggableId, { attributes: ['id'] })
		.then((Model) => {
			if(!Model) return next(createError(404));

			models.Tag
				.findOrCreate({where: {name: req.body.tag}})
				.spread((tag, created) => {

					Model
						.addTag(tag)
						.then(() => res.end())
						.catch((err) => next(createError(err)));
				})
				.catch((err) => next(createError(err)));

		})
		.catch((err) => next(createError(err)));

};


exports.delete = function(req, res, next){

	let taggables = ['task', 'sprint', 'project', 'portfolio'];

	if(taggables.indexOf(req.body.taggble) === -1) return next(createError(400, 'Field taggble must be only ' + taggables.join(' or ') ));
	if(!(+req.body.taggableId > 0)) return next(createError(400, 'Field taggableId must be int and more then 0' ));
	if(typeof req.body.tag !== "string") return next(createError(400, 'Field tag must be string' ));



	models.Tag
		.find({where: {name: req.body.tag}, attributes: ['id'] })
		.then((tag) => {

			models.ItemTag
				.findOne({ where: {
					tagId: tag.dataValues.id,
					taggableId: req.body.taggableId,
					taggable: req.body.taggble,
				}})
				.then((item) => {
					if(!item) return next(createError(404, 'ItemTag not found'));
					item
						.destroy()
						.then(() => res.end())
						.catch((err) => next(createError(err)));
				})
				.catch((err) => next(createError(err)));

		})
		.catch((err) => next(createError(err)));
};


