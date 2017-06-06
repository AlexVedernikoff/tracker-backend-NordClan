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
	},
	type_id: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	notbillable: {
		type: Sequelize.INTEGER(1),
		defaultValue: 0
	},
	budget: {
		type: Sequelize.FLOAT,
		defaultValue: null
	},
	risk_budget: {
		type: Sequelize.FLOAT,
		defaultValue: null
	},
	planned_start_date: {
		type: Sequelize.DATE,
		defaultValue: null
	},
	planned_finish_date: {
		type: Sequelize.DATE,
		defaultValue: null
	},
	fact_start_date: {
		type: Sequelize.DATE,
		defaultValue: null
	},
	fact_finish_date: {
		type: Sequelize.DATE,
		defaultValue: null
	},
	attaches: {
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: null
	},

}, {
	paranoid: false,
	underscored: true,
	tableName: 'projects'
});



class Project {
	constructor(attributes) {
			this.attributes = {};
			this.setAttributes(attributes)
	};



	static get model() {
		return ProjectModel;
	};

	setAttributes(attributes) {
		this.attributes = {
			name: attributes.name,
			description: attributes.description,
			status_id: attributes.status_id,
			type_id: attributes.type_id,
			prefix: attributes.prefix,
			notbillable: attributes.notbillable,
			budget: attributes.budget,
			risk_budget: attributes.risk_budget,
			planned_start_date: attributes.planned_start_date,
			planned_finish_date: attributes.planned_finish_date,
			fact_start_date: attributes.fact_start_date,
			fact_finish_date: attributes.fact_finish_date,
			attaches: attributes.attaches,
		};


	};

	getAttributes() {
		return this.attributes;
	};



}

module.exports = Project;
