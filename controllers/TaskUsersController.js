const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const queries = require('../models/queries');

exports.create = function(req, res, next){
	if(!req.body.taskId) return next(createError(400, 'taskId need'));
	if(!Number.isInteger(+req.body.taskId)) return next(createError(400, 'taskId must be int'));
	if(+req.body.taskId <= 0) return next(createError(400, 'taskId must be > 0'));

	if(!req.body.userId) return next(createError(400, 'userId need'));
	if(!Number.isInteger(+req.body.userId)) return next(createError(400, 'userId must be int'));
	if(+req.body.userId <= 0) return next(createError(400, 'userId must be > 0'));


	models.TaskUsers.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

	Promise.all([
		queries.user.findOneActiveUser(req.body.userId),
		queries.task.findOneActiveTask(req.body.taskId)
	])
		.then(() => {
			return models.TaskUsers
				.findAll({where: {
					taskId: req.body.taskId,
					deletedAt: null
				}})
				.then((taskOldUser) => {
					let chain = Promise.resolve();

					taskOldUser.forEach((oldUser) => {
						if(oldUser.userId!=req.body.userId) {
							chain = chain.then(() => {
								return oldUser.destroy();
							})
						} else {
							throw next(createError(409, 'userId already exist in TaskUsers'));
						}
					});

					return chain.then(() => {
						return models.TaskUsers.create({
							userId: req.body.userId,
							taskId: req.body.taskId
						})
					})
						.then(() => {
							return queries.user.findOneActiveUser(req.body.userId, ['id', 'firstNameRu', 'lastNameRu'])
								.then((user) => {
									const responce = {
										id: user.id,
										fullNameRu: user.fullNameRu,
									};

									res.end(JSON.stringify(responce));
								});

						});
				})
		})
		.catch((err) => {
			next(err);
		});

};

exports.delete = function(req, res, next){

	models.TaskUsers.findOne({
		where: {
			userId: req.params.userId,
			taskId: req.params.taskId,
			deletedAt: null
		}
	})
		.then((taskUsers) => {
			if(!taskUsers) return next(createError(404));

			return taskUsers.destroy()
				.then(() => res.end())
		})

};

