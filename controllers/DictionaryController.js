const createError = require('http-errors');
const Helper = require('../components/Helper');
const models = require('../models');

exports.statuses = function(req, res, next){
	if(!req.params.entity) return next(createError(400, 'entity need'));
	if(['project', 'sprint', 'task'].indexOf(req.params.entity) === -1) return next(createError(400, 'entity must be only \'project\', \'sprint\' or \'task\''));
	const modelName = Helper.firstLetterUp(req.params.entity) + 'StatusesDictionary';
	res.end(JSON.stringify(models[modelName].values));
};

exports.projectRoles = function(req, res, next){
	res.end(JSON.stringify(models.ProjectRolesDictionary.values));
};