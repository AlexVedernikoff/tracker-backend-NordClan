const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
const Project = require('./Project');
sequelizeTransforms(sequelize);

const Sprint = sequelize.define("Sprint", {
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
	createdAt: {type: Sequelize.DATE, field: 'created_at'},
	updatedAt: {type: Sequelize.DATE, field: 'updated_at'},
	deletedAt: {type: Sequelize.DATE, field: 'deleted_at'}
}, {
	underscored: true,
	timestamps: true,
	paranoid: true,
	tableName: 'sprint'
});

Sprint.belongsTo(Project, {foreignKey: {
	name: 'projectId',
	field: 'project_id'
}});

module.exports = Sprint;
