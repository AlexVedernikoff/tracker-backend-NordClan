const models = require('../models');

const dictionariesModels  = [
	models.ProjectStatuses,
	models.SprintStatuses,
	models.TaskStatuses,
];


(() => {
	let chain = Promise.resolve();
	dictionariesModels.forEach(function(model) {
		chain = chain
			.then(() => {
				return model.destroy({where: {}})
					.then(() => model.bulkCreate(model.values));
			})
	});


	chain
		.then(() => {
			console.info('Done');
		})
		.catch((err) => {
			console.error(err);
		});
})();