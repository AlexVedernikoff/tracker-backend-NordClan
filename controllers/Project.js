const ProjectModel = require('../models/Project');

exports.create = function(req, res){

	ProjectModel.model.create({
		name: req.body.name,
		description: req.body.description,
		status_id: req.body.status_id,
	});

	res.end();
};

exports.read = function(req, res){

	ProjectModel.model.findById(req.params.id).then((project) => {

		if(!project) {
			res.statusCode = 404;
			res.end();

		} else {
			console.log(JSON.stringify(project));
			console.log(req.params.id);
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(project.dataValues));
		}

	});

};

exports.update = function(req, res){


	ProjectModel.model.findById(req.params.id)
		.then((project) => {
			if (project) {
				project.updateAttributes({
					name: req.body.name,
					description: req.body.description,
					status_id: req.body.status_id
				})

			}

		});


	res.end('update');
};

exports.delete = function(req, res){

	ProjectModel.model.findById(req.params.id)
		.then((project) => {
			if (project) {
				project.destroy();
			}
		});

	res.end('delete');
};

exports.list = function(req, res){
	let find = ProjectModel.model.findAll({limit: 10}).then(projects => {

		projects = projects ?
			projects.map(
				item =>
					item.dataValues
			) : [];

		console.log(JSON.stringify(projects));
  	res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(projects));

	});

};
