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
	if(+req.body.userId < 0) return next(createError(400, 'userId must be > 0'));

	// удаляю исполнителя у задачи
	if(+req.body.userId === 0) {
        queries.task.findOneActiveTask(req.body.taskId)
			.then(() => {
                return models.TaskUsers.destroy({
					where: {
                        taskId: req.body.taskId,
                        deletedAt: null
					}
				})
					.then(()=>res.end())
			})
            .catch((err) => {
                next(err);
            });
        return;
	}


	models.TaskUsers.beforeValidate((model, options) => {
		model.authorId = req.user.id;
	});

    // ставлю исполнителя у задачи
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
						if(oldUser.userId!==+req.body.userId) {
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

