const createError = require('http-errors');
const models = require('../models');

class TagController {
	constructor(req, res, next) {
		this.req = req;
		this.res = res;
		this.next = next;
	}

	validate(){
		return new Promise((resolve, reject) => {
			this.req.checkBody('taggable', 'taggable must be \'task\' or \'sprint\' or \'project\' or \'portfolio\'' ).isIn(['task', 'sprint', 'project', 'portfolio']);
			this.req.checkBody('taggableId', 'taggableId must be int').isInt();
			this.req.checkBody('tag', 'tab must be more then 2 chars').isLength({min: 2});

			this.req
				.getValidationResult()
				.then((result) => {

					if (!result.isEmpty()) {
						let err = new Error();
						err.statusCode = 400;
						err.name = 'ValidationError';
						err.message = { errors: result.array() };
						this.next(err);
					}

					resolve();

				});
		});
	};

	firstLetterUp(value) {
		return value[0].toUpperCase() + value.substring(1);
	}


	create() {
		this
			.validate()
			.then(()  => {

				models[this.firstLetterUp(this.req.body.taggable)]
					.findByPrimary(this.req.body.taggableId, { attributes: ['id'] })
					.then((Model) => {
						if(!Model) return this.next(createError(404, 'taggable model not found'));

						models.Tag
							.findOrCreate({where: {name: this.req.body.tag.trim()}})
							.spread((tag, created) => {

								Model
									.addTag(tag)
									.then(() => this.res.end())
									.catch((err) => this.next(createError(err)));
							})
							.catch((err) => this.next(createError(err)));

					})
					.catch((err) => this.next(createError(err)));

			});
	};

	remove() {
		this
			.validate()
			.then(()  => {
				models.Tag
					.find({where: {name: this.req.body.tag.trim()}, attributes: ['id'] })
					.then((tag) => {
						if(!tag) return this.next(createError(404, 'tag not found'));

						models.ItemTag
							.findOne({ where: {
								tagId: tag.dataValues.id,
								taggableId: this.req.body.taggableId,
								taggable: this.req.body.taggable,
							}})
							.then((item) => {
								if(!item) return this.next(createError(404, 'ItemTag not found'));
								item
									.destroy()
									.then(() => this.res.end())
									.catch((err) => this.next(createError(err)));
							})
							.catch((err) => this.next(createError(err)));

					})
					.catch((err) => this.next(createError(err)));
			});

	}

}


exports.create = function(req, res, next){
	new TagController(req, res, next).create();
};

exports.delete = function(req, res, next){
	new TagController(req, res, next).remove();
};


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
						.then(() => res.end())
						.catch((err) => next(createError(err)));
				})
				.catch((err) => next(createError(err)));

		});

	} else {
		res.end();
	}

	function extractTags() {
		if('tags' in req.body && req.body.tags) {
			tags = req.body.tags.toString().split(',');
		}
	}
};