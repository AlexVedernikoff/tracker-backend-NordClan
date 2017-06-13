const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
const Portfolio = require('./Portfolio');
sequelizeTransforms(sequelize);

const Project = sequelize.define("projects", {
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
	statusId: {
		field: 'status_id',
		type: Sequelize.INTEGER,
		defaultValue: 0,
		validate: {
			isInt: true,
			min: 0,
			max: 9
		}
	},
	typeId: {
		field: 'type_id',
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
	riskBudget: {
		field: 'risk_budget',
		type: Sequelize.FLOAT,
		defaultValue: null,
		validate: {
			isNumeric: true
		}
	},
	plannedStartDate: {
		field: 'planned_start_date',
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	plannedFinishDate: {
		field: 'planned_finish_date',
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	factStartDate: {
		field: 'fact_start_date',
		type: Sequelize.DATE,
		defaultValue: null,
		validate: {
			isDate: true,
		}
	},
	factFinishDate: {
		field: 'fact_finish_date',
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
	portfolioId: {
		field: 'portfolio_id',
		type: Sequelize.INTEGER,
		defaultValue: null,
		validate: {
			isInt: true
		}
	},
	createdAt: {type: Sequelize.DATE, field: 'created_at'},
	updatedAt: {type: Sequelize.DATE, field: 'updated_at'},
	deletedAt: {type: Sequelize.DATE, field: 'deleted_at'}

}, {
	underscored: true,
	timestamps: true,
	paranoid: true,
	tableName: 'projects'
});

Project.belongsTo(Portfolio, {foreignKey: {
	name: 'portfolioId',
	field: 'portfolio_id'
}});

module.exports = Project;
