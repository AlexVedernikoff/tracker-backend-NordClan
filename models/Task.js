module.exports = function(sequelize, DataTypes) {

	let Task = sequelize.define("Task", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
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
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true
			}
		},
		statusId: {
			field: 'status_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true
			}
		},
		description: {
			trim: true,
			type: DataTypes.TEXT,
			defaultValue: null
		},
		PlannedExecutionTime: {
			field: 'planned_execution_time',
			type: DataTypes.FLOAT,
			defaultValue: null,
			validate: {
				isNumeric: true
			}
		},
		FactExecutionTime: {
			field: 'fact_execution_time',
			type: DataTypes.FLOAT,
			defaultValue: null,
			validate: {
				isNumeric: true
			}
		},
		attaches: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			defaultValue: null,
			validate: {
				notEmpty: true, // не пустая строка
			}
		},
		subTasks: {
			field: 'sub_tasks',
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			defaultValue: null,
			validate: {
				notEmpty: true, // не пустая строка
			}
		},
		linkedTasks: {
			field: 'linked_tasks',
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			defaultValue: null,
			validate: {
				notEmpty: true, // не пустая строка
			}
		},
		prioritiesId: {
			field: 'priorities_id',
			type: DataTypes.INTEGER,
			defaultValue: null,
			validate: {
				isInt: true
			}
		},
		createdAt: {type: DataTypes.DATE, field: 'created_at'},
		updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
		deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
		tableName: 'tasks'
	});


	Task.associate = function(models) {

		Task.belongsTo(models.Project, {foreignKey: {
			name: 'projectId',
			field: 'project_id',
			allowNull: false,
		}});

		Task.belongsTo(models.Task, {foreignKey: {
			name: 'parentId',
			field: 'parent_id'
		}});

		Task.belongsTo(models.Sprint, {foreignKey: {
			name: 'sprintId',
			field: 'sprint_id'
		}});

		Task.belongsToMany(models.Tag, {
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'task'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

	};

	return Task;
};






