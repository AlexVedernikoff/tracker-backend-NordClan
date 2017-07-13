const models = require('../');
const createError = require('http-errors');

exports.name = 'portfolio';

exports.checkEmptyAndDelete = function(portfolioId) {
	console.log(portfolioId);
	return models.Project
		.count({where: {portfolioId:portfolioId}})
		.then((count) => {
			if(count === 0) {
				models.Portfolio.destroy({where: {id: portfolioId}})
			}
		})

};
