const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
const Portfolio = require('./Portfolio');
sequelizeTransforms(sequelize);

const Project = sequelize.define("Project", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: false,
		validate: {
			max: {
				args: 255,
				msg: 'Name must be less than 255 characters.'
			}
		}
	},
	description: {
		trim: true,
		type: Sequelize.TEXT,
		defaultValue: null
	},
	status_id: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		validate: {
			isInt: true,
			min: 0,
			max: 9
		}
	},
	type_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			isInt: true
		}
	},
	notbillable: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		validate: {
			isInt: true,
			min: 0,
			max: 1
		}
	},
	budget: {
		type: Sequelize.FLOAT,
		defaultValue: null,
		validate: {
			isNumeric: true
		}
	},
	risk_budget: {
		type: Sequelize.FLOAT,
		defaultValue: null,
		validate: {
			isNumeric: true
		}
	},
	planned_start_date: {
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	planned_finish_date: {
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	fact_start_date: {
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	fact_finish_date: {
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	attaches: {
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: null,
		validate: {
			notEmpty: true, // не пустая строка
		}
	},

}, {
	paranoid: false,
	underscored: true,
	tableName: 'projects'
});

Project.belongsTo(Portfolio, {foreignKey: 'portfolio_id'});

module.exports = Project;
