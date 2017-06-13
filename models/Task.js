const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
const Project = require('./Project');
const Sprint = require('./Sprint');
sequelizeTransforms(sequelize);

const Task = sequelize.define("Task", {
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
	typeId: {
		field: 'type_id',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			isInt: true
		}
	},
	statusId: {
		field: 'status_id',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			isInt: true
		}
	},
	description: {
		trim: true,
		type: Sequelize.TEXT,
		defaultValue: null
	},
	PlannedExecutionTime: {
		field: 'planned_execution_time',
		type: Sequelize.FLOAT,
		defaultValue: null,
		validate: {
			isNumeric: true
		}
	},
	FactExecutionTime: {
		field: 'fact_execution_time',
		type: Sequelize.FLOAT,
		defaultValue: null,
		validate: {
			isNumeric: true
		}
	},
	attaches: {
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: null,
		validate: {
			notEmpty: true, // не пустая строка
		}
	},
	subTasks: {
		field: 'sub_tasks',
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: null,
		validate: {
			notEmpty: true, // не пустая строка
		}
	},
	linkedTasks: {
		field: 'linked_tasks',
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: null,
		validate: {
			notEmpty: true, // не пустая строка
		}
	},
	prioritiesId: {
		field: 'priorities_id',
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
	timestamps: true,
	paranoid: true,
	underscored: true,
	tableName: 'tasks'
});


Task.belongsTo(Project, {foreignKey: {
	name: 'projectId',
	field: 'project_id',
	allowNull: false,
}});

Task.belongsTo(Task, {foreignKey: {
	name: 'parentId',
	field: 'parent_id'
}});

Task.belongsTo(Sprint, {foreignKey: {
	name: 'sprintId',
	field: 'sprint_id'
}});

module.exports = Task;
