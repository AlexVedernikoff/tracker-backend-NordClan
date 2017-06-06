//const HttpError = require('./HttpError');
const Sequelize = require('sequelize');
const sequelize = require('../orm');

const ProjectModel = sequelize.define("Project", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: Sequelize.STRING,
		defaultValue: null
	},
	description: {
		type: Sequelize.TEXT,
		defaultValue: null
	},
	status_id: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	}

}, {
	paranoid: false,
	underscored: true,
	tableName: 'projects'
});



class Project {
	constructor() {}

	static get model() {
		return ProjectModel;
	}

	static findOne(params) {
		let find = ProjectModel.findOne({ where: params, include: eagerLoad });
		return find.then(project => project ? (new Project()).setData(project.toJSON(), true) : project);
	}

	static findAll(params) {

	}


}

module.exports = Project;
