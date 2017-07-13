const models = require('../');
const createError = require('http-errors');

exports.name = 'project';

exports.findOneActiveProject = function(projectId, attributes = ['id']) {
	return models.Project
		.findOne({where: {
			id: projectId,
			deletedAt: null,
		}, attributes: attributes})
		.then((project) => {
			if(!project) throw createError(404, 'Project not found');
			return project;
		})

};

exports.savePortfolioToProject = function(projectModel, portfolioName) {
	models.Portfolio
		.findOrCreate({
			where: {
				name: portfolioName,
				authorId: projectModel.authorId,
			}
		})
		.spread((portfolio, created) => {
			if(!portfolio) throw createError(500, 'Can not create Portfolio');
			return projectModel.updateAttributes({
				portfolioId: portfolio.id
			});
		})
};