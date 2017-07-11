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

